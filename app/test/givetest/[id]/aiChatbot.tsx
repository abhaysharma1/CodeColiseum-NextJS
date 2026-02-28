"use client";

import { useEffect, useRef, useState } from "react";
import { Chat } from "@/components/ui/chat";
import { type Message } from "@/components/ui/chat-message";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";

interface AiChatBotProps {
  groupId: string;
  examId: string;
  problemId: string;
  code: string;
  language: string;
}

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 30; // 60 seconds max

const getChatStorageKey = (examId: string, problemId: string) =>
  `ai_chat_${examId}_${problemId}`;

const loadMessages = (examId: string, problemId: string): Message[] => {
  try {
    const raw = localStorage.getItem(getChatStorageKey(examId, problemId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Message[];
    // Re-hydrate createdAt strings back to Date objects
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

function AiChatBot({
  groupId,
  examId,
  problemId,
  code,
  language,
}: AiChatBotProps) {
  const [messages, setMessages] = useState<Message[]>(() =>
    loadMessages(examId, problemId)
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const stopPollingRef = useRef(false);

  // Reload messages from localStorage when examId or problemId changes
  useEffect(() => {
    stopPollingRef.current = true; // cancel any in-flight poll for the old problem
    setIsLoading(false);
    setInput("");
    const messages = loadMessages(examId, problemId);
    setMessages([]);
    setMessages(messages);
  }, [examId, problemId]);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      localStorage.setItem(
        getChatStorageKey(examId, problemId),
        JSON.stringify(messages)
      );
    } catch {
      // Quota exceeded or unavailable — fail silently
    }
  }, [messages, examId, problemId]);

  const handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    setInput(e.target.value);
  };

  const pollForResponse = async (msgExamId: string, msgProblemId: string) => {
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
            `${getBackendURL()}/student/exam/ai/chat/status`,
            {
              params: { examId: msgExamId, problemId: msgProblemId },
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
      // Step 1: trigger the AI
      await axios.post(
        `${getBackendURL()}/student/exam/ai/chat`,
        {
          groupId,
          examId,
          problemId,
          message: userMessage.content,
          language,
        },
        { withCredentials: true }
      );

      // Step 2: poll until completed
      const responseContent = await pollForResponse(examId, problemId);

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
    // Trigger submit with the suggestion text
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

export default AiChatBot;
