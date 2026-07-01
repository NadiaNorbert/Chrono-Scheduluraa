import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatTileProps {
  label:     string;
  value:     string | number;
  sublabel?: string;
  icon:      LucideIcon;
  iconClass?: string;
  trend?:    "up" | "down" | "neutral";
  trendVal?: string;
}

export function StatTile({
  label, value, sublabel, icon: Icon, iconClass = "bg-primary/10 text-primary",
  trend, trendVal,
}: StatTileProps) {
  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/5 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={cn("flex size-9 items-center justify-center rounded-lg", iconClass)}>
          <Icon className="size-4" />
        </div>
        {trend && trendVal && (
          <span className={cn(
            "text-[10px] font-medium rounded-full px-1.5 py-0.5",
            trend === "up"   && "bg-primary/10 text-primary",
            trend === "down" && "bg-destructive/10 text-destructive",
            trend === "neutral" && "bg-muted text-muted-foreground",
          )}>
            {trendVal}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}
