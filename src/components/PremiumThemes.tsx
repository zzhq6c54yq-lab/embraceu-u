import { useState } from "react";
import { usePremium } from "@/hooks/usePremium";
import { Check, Lock, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export type PremiumTheme = "gold" | "rose" | "midnight" | "emerald" | "aurora";

interface ThemeOption {
  id: PremiumTheme;
  name: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
    gradient: string;
  };
}

const themes: ThemeOption[] = [
  {
    id: "gold",
    name: "Royal Gold",
    description: "Classic luxury with warm golden tones",
    colors: {
      primary: "from-amber-400 to-amber-600",
      accent: "bg-amber-500",
      gradient: "from-amber-400 via-yellow-300 to-amber-500",
    },
  },
  {
    id: "rose",
    name: "Rose Quartz",
    description: "Elegant pink with soft warmth",
    colors: {
      primary: "from-rose-400 to-pink-600",
      accent: "bg-rose-500",
      gradient: "from-rose-400 via-pink-300 to-rose-500",
    },
  },
  {
    id: "midnight",
    name: "Midnight Luxe",
    description: "Deep blues with silver accents",
    colors: {
      primary: "from-indigo-400 to-purple-600",
      accent: "bg-indigo-500",
      gradient: "from-indigo-400 via-violet-400 to-purple-500",
    },
  },
  {
    id: "emerald",
    name: "Emerald Elite",
    description: "Rich greens for natural elegance",
    colors: {
      primary: "from-emerald-400 to-teal-600",
      accent: "bg-emerald-500",
      gradient: "from-emerald-400 via-teal-400 to-emerald-500",
    },
  },
  {
    id: "aurora",
    name: "Aurora Dreams",
    description: "Mystical northern lights palette",
    colors: {
      primary: "from-cyan-400 to-violet-600",
      accent: "bg-cyan-500",
      gradient: "from-cyan-400 via-purple-400 to-pink-400",
    },
  },
];

interface PremiumThemesProps {
  onThemeChange?: (theme: PremiumTheme) => void;
  currentTheme?: PremiumTheme;
}

const PremiumThemes = ({ onThemeChange, currentTheme = "gold" }: PremiumThemesProps) => {
  const { isPremium } = usePremium();
  const [selectedTheme, setSelectedTheme] = useState<PremiumTheme>(currentTheme);

  const handleSelectTheme = (themeId: PremiumTheme) => {
    if (!isPremium) return;
    setSelectedTheme(themeId);
    onThemeChange?.(themeId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="w-5 h-5 text-accent" />
        <h3 className="font-serif text-lg">Premium Themes</h3>
        {!isPremium && (
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" /> Pro Only
          </span>
        )}
      </div>

      <div className="grid gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleSelectTheme(theme.id)}
            disabled={!isPremium}
            className={cn(
              "relative w-full p-4 rounded-xl border transition-all duration-300 text-left",
              isPremium
                ? "hover:scale-[1.02] cursor-pointer"
                : "opacity-60 cursor-not-allowed",
              selectedTheme === theme.id && isPremium
                ? "border-accent ring-2 ring-accent/30"
                : "border-border hover:border-accent/50"
            )}
          >
            <div className="flex items-center gap-4">
              {/* Theme Preview */}
              <div
                className={cn(
                  "w-12 h-12 rounded-lg bg-gradient-to-br shrink-0",
                  theme.colors.primary
                )}
              />

              {/* Theme Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {theme.name}
                  </span>
                  {selectedTheme === theme.id && isPremium && (
                    <Check className="w-4 h-4 text-accent" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {theme.description}
                </p>
              </div>

              {/* Lock Icon for non-premium */}
              {!isPremium && (
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </div>

            {/* Color Bar Preview */}
            <div
              className={cn(
                "mt-3 h-1.5 rounded-full bg-gradient-to-r",
                theme.colors.gradient
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PremiumThemes;
