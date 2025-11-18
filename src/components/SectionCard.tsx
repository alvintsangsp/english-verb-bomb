import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps extends Omit<React.ComponentProps<typeof Card>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
}

const SectionCard = ({
  title,
  description,
  icon,
  actions,
  children,
  className,
  compact,
  ...props
}: SectionCardProps) => {
  return (
    <Card
      className={cn(
        "border-[3px] border-border/80 bg-card/95 rounded-[calc(var(--radius)+0.75rem)] shadow-lg overflow-hidden",
        compact ? "p-4 sm:p-5" : "p-5 sm:p-8",
        className,
      )}
      {...props}
    >
      <CardContent className="p-0 flex flex-col gap-4">
        {(title || description || icon || actions) && (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              {icon && <div className="text-primary">{icon}</div>}
              <div>
                {title && <div className="text-2xl font-black text-foreground">{title}</div>}
                {description && <p className="text-sm md:text-base text-muted-foreground">{description}</p>}
              </div>
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
        )}
        <div className="space-y-4">{children}</div>
      </CardContent>
    </Card>
  );
};

export default SectionCard;

