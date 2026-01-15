import { useEffect, useState } from "react";
import { Check, Sparkles, Heart, Star, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionFeedbackProps {
  type: "success" | "celebration" | "streak" | "love" | "star";
  isVisible: boolean;
  onComplete?: () => void;
  message?: string;
}

const ActionFeedback = ({ type, isVisible, onComplete, message }: ActionFeedbackProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!show) return null;

  const icons = {
    success: Check,
    celebration: Sparkles,
    streak: Flame,
    love: Heart,
    star: Star,
  };

  const colors = {
    success: "bg-green-500 text-white",
    celebration: "bg-purple-500 text-white",
    streak: "bg-orange-500 text-white",
    love: "bg-pink-500 text-white",
    star: "bg-yellow-500 text-white",
  };

  const Icon = icons[type];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      <div
        className={cn(
          "flex flex-col items-center gap-3 p-6 rounded-2xl shadow-2xl",
          "animate-in zoom-in-95 fade-in duration-300",
          colors[type]
        )}
      >
        <div className="relative">
          <Icon className="w-12 h-12 animate-bounce" />
          {type === "celebration" && (
            <>
              <Sparkles className="absolute -top-2 -left-3 w-5 h-5 animate-pulse" />
              <Sparkles className="absolute -top-2 -right-3 w-5 h-5 animate-pulse delay-100" />
              <Sparkles className="absolute -bottom-1 left-0 w-4 h-4 animate-pulse delay-200" />
            </>
          )}
        </div>
        {message && (
          <p className="text-sm font-semibold text-center max-w-[200px]">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ActionFeedback;
