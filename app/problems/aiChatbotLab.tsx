"use client";

import { useEffect, useRef, useState } from "react";
import { Chat } from "@/components/ui/chat";
import { type Message } from "@/components/ui/chat-message";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";

interface AiChatBotLabProps {
  labId: string;
  problemId: string;
  code: string;
  language: string;
}

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 30;

const getChatStorageKey = (problemId: string) =>
  `ai_chat_lab_${problemId}`;

const loadMessages = (problemId: string): Message[] => {
  try {
    const raw = localStorage.getItem(getChatStorageKey(problemId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Message[];
    return parsed.map((m) => ({
      ...m,
      createdAt: m.createdAt
        ? new Date(m.createdAt as unknown as string)
        : undefined,
    }));
  } catch {
    return [];
  }
};

function AiChatBotLab({
  labId,
  problemId,
  code,
  language,
}: AiChatBotLabProps) {
  const [messages, setMessages] = useState<Message[]>(() =>
    loadMessages(problemId)
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const stopPollingRef = useRef(false);

  useEffect(() => {
    stopPollingRef.current = true;
    setIsLoading(false);
    setInput("");
    setMessages(loadMessages(problemId));
  }, [problemId]);

  useEffect(() => {
    if (messages.length === 0) return;
    try {
      localStorage.setItem(
        getChatStorageKey(problemId),
        JSON.stringify(messages)
      );
    } catch {
      // fail silently
    }
  }, [messages, problemId]);

  const handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    setInput(e.target.value);
  };

  const pollForResponse = async (msgProblemId: string) => {
    stopPollingRef.current = false;
    let attempts = 0;

    return new Promise<string>((resolve, reject) => {
      const poll = async () => {
        if (stopPollingRef.current) {
          reject(new Error("Polling stopped"));
          return;
        }
        if (attempts >= POLL_MAX_ATTEMPTS) {
          reject(new Error("Timed out waiting for AI response"));
          return;
        }
        attempts++;

        try {
          const res = await axios.get(
            `${getBackendURL()}/student/lab/ai/chat/status`,
            {
              params: { labId, problemId: msgProblemId },
              withCredentials: true,
            }
          );

          const data = res.data as {
            status: string;
            message?: {
              id: string;
              content: string;
              createdAt: string;
              role: string;
            };
          };

          if (data.status === "COMPLETED" && data.message) {
            resolve(data.message.content);
          } else {
            setTimeout(poll, POLL_INTERVAL_MS);
          }
        } catch (err) {
          reject(err);
        }
      };

      setTimeout(poll, POLL_INTERVAL_MS);
    });
  };

  const handleSubmit = async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await axios.post(
        `${getBackendURL()}/student/lab/ai/chat`,
        {
          labId,
          problemId,
          message: userMessage.content,
          language,
        },
        { withCredentials: true }
      );

      const responseContent = await pollForResponse(problemId);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorText =
        err?.message === "Polling stopped"
          ? "Request cancelled."
          : (err?.message ?? "An error occurred. Please try again.");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorText,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    stopPollingRef.current = true;
    setIsLoading(false);
  };

  const append = (message: { role: "user"; content: string }) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      ...message,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput(message.content);
  };

  return (
    <div className="h-full overflow-y-scroll pb-8">
      <div className="h-[calc(100vh-13rem)]">
        <Chat
          className="h-full"
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isGenerating={isLoading}
          stop={stop}
          append={append}
          setMessages={setMessages}
          suggestions={[
            "Explain the Problem Description in detail.",
            "What would be the expected complexity of this problem?",
          ]}
        />
      </div>
    </div>
  );
}

export default AiChatBotLab;
