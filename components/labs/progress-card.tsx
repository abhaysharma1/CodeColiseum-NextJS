"use client";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface ProgressCardProps {
  completedProblems: number;
  totalProblems: number;
  completionPercentage: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  segments?: { label: string; percentage: number; color?: string }[];
}

export function ProgressCard({
  completedProblems,
  totalProblems,
  completionPercentage,
  showLabel = true,
  size = "md",
  segments,
}: ProgressCardProps) {
  const sizeMap = { sm: 64, md: 96, lg: 128 };
  const strokeWidthMap = { sm: 5, md: 6, lg: 8 };
  const dim = sizeMap[size];
  const strokeWidth = strokeWidthMap[size];
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completionPercentage / 100) * circumference;

  const getColor = () => {
    if (completionPercentage === 100) return "#22c55e";
    if (completionPercentage > 50) return "var(--primary)";
    return "#eab308";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {completionPercentage === 100 ? (
            <CheckCircle2 className="text-green-500" style={{ width: dim * 0.35, height: dim * 0.35 }} />
          ) : (
            <span className="font-mono text-sm font-bold tabular-nums" style={{ fontSize: dim * 0.22 }}>
              {completionPercentage}%
            </span>
          )}
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {completedProblems} / {totalProblems} Solved
          </p>
        </div>
      )}
      {segments && segments.length > 0 && (
        <div className="w-full space-y-1.5">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-16 text-right text-muted-foreground truncate">{seg.label}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: seg.color || "var(--primary)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${seg.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                />
              </div>
              <span className="w-10 text-right font-mono tabular-nums text-muted-foreground">
                {Math.round(seg.percentage)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
