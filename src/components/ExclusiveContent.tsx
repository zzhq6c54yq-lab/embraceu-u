import { Lock, Check, ChevronRight } from "lucide-react";
import { usePremium } from "@/hooks/usePremium";
import { useNavigate } from "react-router-dom";
import { 
  Headphones, 
  Heart, 
  Wind, 
  Sparkles 
} from "lucide-react";

interface ExclusiveItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  path: string;
}

const exclusiveContent: ExclusiveItem[] = [
  {
    id: "meditations",
    title: "Guided Meditations",
    description: "Premium sessions for deep relaxation",
    icon: Headphones,
    category: "Audio",
    path: "/exclusive/meditations",
  },
  {
    id: "affirmations",
    title: "Affirmation Packs",
    description: "Curated collections for growth",
    icon: Heart,
    category: "Mindset",
    path: "/exclusive/affirmations",
  },
  {
    id: "breathwork",
    title: "Advanced Breathwork",
    description: "Expert-level breathing techniques",
    icon: Wind,
    category: "Practice",
    path: "/exclusive/breathwork",
  },
  {
    id: "rituals",
    title: "Self-Love Rituals",
    description: "Daily rituals designed by experts",
    icon: Sparkles,
    category: "Wellness",
    path: "/exclusive/rituals",
  },
];

interface ExclusiveContentProps {
  onUpgradeClick?: () => void;
}

const ExclusiveContent = ({ onUpgradeClick }: ExclusiveContentProps) => {
  const { isPremium } = usePremium();
  const navigate = useNavigate();

  const handleItemClick = (item: ExclusiveItem) => {
    if (isPremium) {
      navigate(item.path);
    } else {
      onUpgradeClick?.();
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-label">EXCLUSIVE CONTENT</h3>
        {isPremium && (
          <span className="text-xs text-accent flex items-center gap-1">
            <Check className="w-3 h-3" />
            Unlocked
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {exclusiveContent.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`
                relative p-4 rounded-xl text-left transition-all duration-300
                ${isPremium 
                  ? "card-embrace hover:border-accent/50 cursor-pointer" 
                  : "card-embrace opacity-70 cursor-pointer"}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${isPremium ? "bg-accent/20" : "bg-muted"}
                `}>
                  <Icon className={`w-6 h-6 ${isPremium ? "text-accent" : "text-muted-foreground"}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-serif italic text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                {isPremium ? (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              {/* Category badge */}
              <span className={`
                absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full
                ${isPremium ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}
              `}>
                {item.category}
              </span>
            </button>
          );
        })}
      </div>

      {!isPremium && (
        <button
          onClick={onUpgradeClick}
          className="w-full py-3 text-sm text-accent hover:text-accent/80 transition-colors"
        >
          Upgrade to unlock all content →
        </button>
      )}
    </section>
  );
};

export default ExclusiveContent;