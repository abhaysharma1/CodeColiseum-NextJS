"use client";
import { motion } from "framer-motion";
import { Calendar, Clock, Layers, Trophy } from "lucide-react";

interface LabCardProps {
  title: string;
  description: string | null;
  modulesCount: number;
  assignedGroupsCount?: number;
  createdAt: string;
  completionPercentage?: number;
  status?: "not_started" | "in_progress" | "completed";
  dueDate?: string;
  currentWeek?: number;
  onClick?: () => void;
}

const statusConfig = {
  not_started: { border: "border-muted", ribbon: "bg-muted text-muted-foreground", label: "Not Started" },
  in_progress: { border: "border-yellow-500", ribbon: "bg-yellow-500/10 text-yellow-600", label: "In Progress" },
  completed: { border: "border-green-500", ribbon: "bg-green-500/10 text-green-600", label: "Completed" },
};

function DonutRing({ percentage, size = 48 }: { percentage: number; size?: number }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (percentage / 100) * circ;
  const color = percentage === 100 ? "#22c55e" : percentage > 50 ? "var(--primary)" : "#eab308";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-mono font-bold tabular-nums">{percentage}%</span>
      </div>
    </div>
  );
}

export function LabCard({
  title,
  description,
  modulesCount,
  assignedGroupsCount,
  createdAt,
  completionPercentage = 0,
  status = "not_started",
  dueDate,
  currentWeek,
  onClick,
}: LabCardProps) {
  const cfg = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative group cursor-pointer rounded-xl"
      onClick={onClick}
    >
      <div className={`absolute inset-0 rounded-xl border-t-2 ${cfg.border} transition-colors duration-200`} />
      <div className="relative rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className={`absolute top-3 right-0 ${cfg.ribbon} px-3 py-0.5 text-[11px] font-medium rounded-l-full`}>
          {cfg.label}
        </div>
        <div className="p-4 space-y-3 relative z-10">
          <div className="flex items-start gap-3">
            <DonutRing percentage={completionPercentage} />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base tracking-tight truncate group-hover:text-primary transition-colors">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              <span>{modulesCount} module{modulesCount !== 1 ? "s" : ""}</span>
            </div>
            {assignedGroupsCount !== undefined && (
              <div className="flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5" />
                <span>{assignedGroupsCount} group{assignedGroupsCount !== 1 ? "s" : ""}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {(currentWeek || dueDate) && (
            <div className="flex items-center gap-3 text-xs pt-1 border-t border-border/50">
              {currentWeek && (
                <span className="font-medium text-primary">Week {currentWeek}</span>
              )}
              {dueDate && (
                <div className="flex items-center gap-1 text-muted-foreground ml-auto">
                  <Clock className="h-3 w-3" />
                  <span>Due {new Date(dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
