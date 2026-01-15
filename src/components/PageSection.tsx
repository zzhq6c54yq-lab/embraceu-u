import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
  headerClassName?: string;
  action?: ReactNode;
  dataTour?: string;
}

const PageSection = ({
  children,
  title,
  subtitle,
  icon: Icon,
  className,
  headerClassName,
  action,
  dataTour,
}: PageSectionProps) => {
  return (
    <section className={cn("py-4", className)} data-tour={dataTour}>
      {(title || action) && (
        <div className={cn("flex items-center justify-between mb-4", headerClassName)}>
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
            )}
            <div>
              {title && (
                <h2 className="font-semibold text-foreground text-base">{title}</h2>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
};

export default PageSection;
