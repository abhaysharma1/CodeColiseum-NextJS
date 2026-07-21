"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertCircle, FileText } from "lucide-react"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { getBackendURL } from "@/utils/utilities"
import axios from "axios"

interface ProblemData {
  id: string
  number: number
  title: string
  description: string
  difficulty: string
  tags: { tag: { id: string; name: string } }[]
}

interface ProblemDescriptionPanelProps {
  problemId: string | null
}

const difficultyStyles: Record<string, string> = {
  EASY:
    "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800",
  MEDIUM:
    "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  HARD:
    "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800",
}

export function ProblemDescriptionPanel({
  problemId,
}: ProblemDescriptionPanelProps) {
  const [problemData, setProblemData] = useState<ProblemData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!problemId) {
      setProblemData(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setProblemData(null)

    axios
      .get(`${getBackendURL()}/problems/${problemId}`, {
        withCredentials: true,
      })
      .then((res) => {
        if (!cancelled) {
          setProblemData(res.data as ProblemData)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.message || "Failed to load problem description",
          )
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [problemId])

  return (
    <div className="w-[420px] flex-shrink-0 border rounded-md overflow-hidden flex flex-col bg-background">
      {problemData && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/30 shrink-0">
          <span className="text-sm font-semibold truncate min-w-0">
            {problemData.number}. {problemData.title}
          </span>
          <span
            className={`text-[11px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${
              difficultyStyles[problemData.difficulty] ?? ""
            }`}
          >
            {problemData.difficulty}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {!problemId && !loading && !error && (
          <div className="flex flex-col items-center justify-center gap-2 h-full min-h-[120px] text-center">
            <FileText className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground/60">
              Hover over a problem to preview its description
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center min-h-[120px]">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-2 min-h-[120px] text-center">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {!loading && !error && problemData && (
          <div className="prose-sm max-w-none">
            <MarkdownRenderer>
              {problemData.description || "*No description provided*"}
            </MarkdownRenderer>
          </div>
        )}
      </div>
    </div>
  )
}
