import { Heart, Target, Sparkles, Eye, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type MemoryType = "mood" | "gratitude" | "pattern" | "quality" | "vision";

interface MemoryCardProps {
  type: MemoryType;
  title: string;
  content: string;
  date: string;
  metadata?: Record<string, string>;
}

const typeConfig: Record<MemoryType, {
  icon: typeof Heart;
  color: string;
  bgColor: string;
  label: string;
}> = {
  mood: {
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    label: "Mood",
  },
  gratitude: {
    icon: Sparkles,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Gratitude",
  },
  pattern: {
    icon: Target,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    label: "Pattern Released",
  },
  quality: {
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Quality",
  },
  vision: {
    icon: Eye,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Vision",
  },
};

const MemoryCard = ({
  type,
  title,
  content,
  date,
  metadata,
}: MemoryCardProps) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  const formattedDate = format(new Date(date), "MMM d, yyyy");

  return (
    <div className="card-embrace hover:shadow-card transition-shadow">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            config.bgColor
          )}
        >
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={cn("text-xs font-medium", config.color)}>
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
          <h4 className="font-serif italic text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{content}</p>
          
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(metadata).map(([key, value]) => (
                <span
                  key={key}
                  className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground"
                >
                  {value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
