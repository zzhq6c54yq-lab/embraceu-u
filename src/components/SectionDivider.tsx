import { cn } from "@/lib/utils";

interface SectionDividerProps {
  className?: string;
  variant?: "subtle" | "gradient" | "dashed";
}

const SectionDivider = ({ className, variant = "subtle" }: SectionDividerProps) => {
  const variants = {
    subtle: "h-px bg-border/50",
    gradient: "h-px bg-gradient-to-r from-transparent via-border to-transparent",
    dashed: "h-px border-t border-dashed border-border/50",
  };

  return <div className={cn("my-6", variants[variant], className)} />;
};

export default SectionDivider;
