"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, Trophy, Timer, ArrowRight, Sparkles } from "lucide-react";

interface AssessmentCardProps {
  title: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  status: string;
  questionsCount?: number;
  score?: number;
  rank?: number;
  onEnter?: () => void;
  onViewResult?: () => void;
  variant?: "teacher" | "student";
}

function CountdownTimer({ endTime }: { endTime: string }) {
  const [remaining, setRemaining] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) return setRemaining("Time's up!");
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s`);
      setUrgent(diff < 300000);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return (
    <div className={`flex items-center gap-1.5 text-sm font-mono tabular-nums ${urgent ? "text-destructive animate-pulse" : "text-foreground"}`}>
      <Timer className={`h-4 w-4 ${urgent ? "text-destructive" : "text-muted-foreground"}`} />
      <span>{remaining}</span>
    </div>
  );
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  UPCOMING: { label: "Upcoming", color: "text-muted-foreground", bg: "bg-muted", icon: Clock },
  ACTIVE: { label: "Active", color: "text-green-600", bg: "bg-green-500/10", icon: Sparkles },
  COMPLETED: { label: "Completed", color: "text-primary", bg: "bg-primary/10", icon: Trophy },
  NOT_AVAILABLE: { label: "Not Available", color: "text-muted-foreground", bg: "bg-muted", icon: Clock },
};

export function AssessmentCard({
  title,
  startTime,
  endTime,
  durationMinutes,
  status,
  questionsCount,
  score,
  rank,
  onEnter,
  onViewResult,
  variant = "student",
}: AssessmentCardProps) {
  const cfg = statusConfig[status] || statusConfig.NOT_AVAILABLE;
  const StatusIcon = cfg.icon;
  const showEnterButton = status === "ACTIVE" || (status === "UPCOMING" && variant === "teacher");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
    >
      <div className="bg-gradient-to-r from-primary/10 to-transparent px-5 py-3 border-b border-border/50">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold tracking-tight">{title}</h3>
              <Badge className={`${cfg.bg} ${cfg.color} border-0 text-[10px] h-5 gap-1`}>
                <StatusIcon className="h-3 w-3" />
                {cfg.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Assessment</p>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-4">
        {status === "ACTIVE" && endTime && (
          <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
            <span className="text-xs text-muted-foreground">Time Remaining</span>
            <CountdownTimer endTime={endTime} />
          </div>
        )}
        <div className="space-y-2.5">
          {startTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>
                {status === "UPCOMING" ? "Starts" : "Started"}:{" "}
                {new Date(startTime).toLocaleString()}
              </span>
            </div>
          )}
          {durationMinutes && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>Duration: {durationMinutes} minutes</span>
            </div>
          )}
          {questionsCount !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span>{questionsCount} questions</span>
            </div>
          )}
        </div>
        {score !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3 bg-primary/5 rounded-lg px-4 py-3"
          >
            <Trophy className="h-5 w-5 text-yellow-500" />
            <div>
              <span className="text-lg font-bold tabular-nums">{score}</span>
              <span className="text-sm text-muted-foreground ml-1">points</span>
              {rank !== undefined && (
                <span className="text-sm text-muted-foreground ml-2">
                  &middot; Rank: #{rank}
                </span>
              )}
            </div>
          </motion.div>
        )}
        {(showEnterButton || (status === "COMPLETED" && onViewResult)) && (
          <div className="pt-1">
            {status === "COMPLETED" && onViewResult ? (
              <Button variant="outline" size="sm" onClick={onViewResult} className="gap-1.5">
                View Result <ArrowRight className="h-3 w-3" />
              </Button>
            ) : (
              showEnterButton && onEnter && (
                <Button size="sm" onClick={onEnter} className="gap-1.5">
                  {status === "UPCOMING" ? "View Details" : "Enter Exam"}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
