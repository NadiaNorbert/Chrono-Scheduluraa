"use client";

import { cn } from "@/lib/utils";

interface BarData {
  label:  string;
  value:  number;
  value2?: number;  // optional second series
}

interface BarChartProps {
  data:    BarData[];
  label1?: string;
  label2?: string;
  color1?: string;
  color2?: string;
  height?: number;
  className?: string;
}

/**
 * Pure CSS/SVG bar chart — no charting library.
 * Supports dual-series (grouped) bars.
 */
export function BarChart({
  data, label1 = "Series 1", label2, color1 = "bg-primary",
  color2 = "bg-accent-foreground/50", height = 160, className,
}: BarChartProps) {
  const max = Math.max(...data.flatMap((d) => [d.value, d.value2 ?? 0]), 1);

  return (
    <div className={cn("w-full", className)}>
      {/* Legend */}
      {label2 && (
        <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className={cn("size-2.5 rounded-sm", color1)} /> {label1}
          </span>
          <span className="flex items-center gap-1">
            <span className={cn("size-2.5 rounded-sm", color2)} /> {label2}
          </span>
        </div>
      )}

      {/* Bars */}
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((d, i) => {
          const h1 = Math.round((d.value  / max) * (height - 24));
          const h2 = d.value2 != null ? Math.round((d.value2 / max) * (height - 24)) : null;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="flex items-end gap-0.5 w-full justify-center">
                <div
                  style={{ height: Math.max(h1, 2) }}
                  className={cn("flex-1 rounded-t-sm transition-all", color1)}
                  title={`${label1}: ${d.value}`}
                />
                {h2 != null && (
                  <div
                    style={{ height: Math.max(h2, 2) }}
                    className={cn("flex-1 rounded-t-sm transition-all", color2)}
                    title={`${label2}: ${d.value2}`}
                  />
                )}
              </div>
              <span className="text-[9px] text-muted-foreground truncate max-w-full px-0.5">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
