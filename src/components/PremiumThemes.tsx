import { Lock, Check } from "lucide-react";
import { useTheme, type ThemePreference } from "@/hooks/useTheme";

interface ThemeOption {
  id: ThemePreference;
  name: string;
  description: string;
  previewColors: string[];
}

const themes: ThemeOption[] = [
  {
    id: "gold",
    name: "Classic Gold",
    description: "Luxurious warmth",
    previewColors: ["hsl(42, 85%, 52%)", "hsl(38, 80%, 38%)", "hsl(45, 90%, 68%)"],
  },
  {
    id: "rose",
    name: "Rose Quartz",
    description: "Soft elegance",
    previewColors: ["hsl(350, 60%, 65%)", "hsl(345, 50%, 50%)", "hsl(355, 70%, 80%)"],
  },
  {
    id: "midnight",
    name: "Midnight Blue",
    description: "Deep serenity",
    previewColors: ["hsl(220, 60%, 30%)", "hsl(225, 50%, 20%)", "hsl(215, 70%, 45%)"],
  },
  {
    id: "emerald",
    name: "Emerald Forest",
    description: "Natural harmony",
    previewColors: ["hsl(150, 50%, 40%)", "hsl(155, 45%, 30%)", "hsl(145, 60%, 55%)"],
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Mystical glow",
    previewColors: ["hsl(280, 60%, 55%)", "hsl(200, 70%, 50%)", "hsl(320, 50%, 60%)"],
  },
];

interface PremiumThemesProps {
  onThemeChange?: (theme: ThemePreference) => void;
}

const PremiumThemes = ({ onThemeChange }: PremiumThemesProps) => {
  const { theme: currentTheme, updateTheme, isPremium } = useTheme();

  const handleSelectTheme = (themeId: ThemePreference) => {
    if (!isPremium && themeId !== "gold") return;
    updateTheme(themeId);
    onThemeChange?.(themeId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-label">PREMIUM THEMES</h3>
        {!isPremium && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Pro only
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => {
          const isSelected = currentTheme === theme.id;
          const isLocked = !isPremium && theme.id !== "gold";
          
          return (
            <button
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id)}
              disabled={isLocked}
              className={`
                relative p-4 rounded-xl text-left transition-all duration-300
                ${isSelected 
                  ? "ring-2 ring-accent shadow-lg" 
                  : "border border-border hover:border-accent/50"}
                ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {/* Color preview */}
              <div className="flex gap-1 mb-3">
                {theme.previewColors.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* Theme info */}
              <p className="font-serif italic text-sm text-foreground">
                {theme.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {theme.description}
              </p>
              
              {/* Selected indicator */}
              {isSelected && isPremium && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-3 h-3 text-accent-foreground" />
                </div>
              )}
              
              {/* Lock indicator */}
              {isLocked && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PremiumThemes;
