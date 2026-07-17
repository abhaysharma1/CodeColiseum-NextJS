"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function RatingStars({
  value,
  onChange,
  readonly = false,
  size = "md",
  showValue = false,
}: RatingStarsProps) {
  const [hovered, setHovered] = useState(0);

  const displayValue = hovered || value;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayValue;
          const halfFilled = !filled && star - 0.5 <= displayValue;

          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              className={cn(
                "transition-colors",
                readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
              )}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => !readonly && setHovered(star)}
              onMouseLeave={() => !readonly && setHovered(0)}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-all",
                  filled
                    ? "fill-yellow-400 text-yellow-400"
                    : halfFilled
                      ? "fill-yellow-400/50 text-yellow-400/50"
                      : "fill-none text-muted-foreground/30",
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium tabular-nums ml-1">
          {value > 0 ? value.toFixed(1) : "—"}
        </span>
      )}
    </div>
  );
}
