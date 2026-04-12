
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface TelemetryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
  footer?: React.ReactNode;
}

export function TelemetryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  footer,
}: TelemetryCardProps) {
  return (
    <Card className={cn("bg-card/50 border-white/5 overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold tracking-tighter">{value}</div>
          {trend && (
            <span
              className={cn(
                "text-[10px] font-mono px-1 rounded",
                trend.positive
                  ? "bg-accent/10 text-accent"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {trend.positive ? "+" : ""}
              {trend.value}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">
            {subtitle}
          </p>
        )}
        {footer && <div className="mt-4 pt-4 border-t border-white/5">{footer}</div>}
      </CardContent>
    </Card>
  );
}
