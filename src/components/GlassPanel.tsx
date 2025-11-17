import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4 sm:p-5",
  md: "p-6 sm:p-8",
  lg: "p-8 sm:p-10",
};

const GlassPanel = ({ className, children, padding = "md", ...props }: GlassPanelProps) => {
  return (
    <div
      className={cn(
        "glass-panel rounded-[calc(var(--radius)+0.5rem)] border border-border/70 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.6)]",
        paddingMap[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassPanel;

