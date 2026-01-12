import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
}

interface SectionNavigatorProps {
  sections: Section[];
  className?: string;
}

const SectionNavigator = ({ sections, className }: SectionNavigatorProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const updateCurrentSection = useCallback(() => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    
    // Find which section is most visible
    let bestIndex = 0;
    let bestVisibility = 0;
    
    sections.forEach((section, index) => {
      const element = document.getElementById(section.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const visibility = Math.max(0, visibleHeight / viewportHeight);
        
        if (visibility > bestVisibility) {
          bestVisibility = visibility;
          bestIndex = index;
        }
      }
    });
    
    setCurrentIndex(bestIndex);
    
    // Hide when at very top or bottom
    const maxScroll = document.documentElement.scrollHeight - viewportHeight;
    setIsVisible(scrollY > 100 && scrollY < maxScroll - 100);
  }, [sections]);

  useEffect(() => {
    window.addEventListener("scroll", updateCurrentSection, { passive: true });
    updateCurrentSection();
    return () => window.removeEventListener("scroll", updateCurrentSection);
  }, [updateCurrentSection]);

  const scrollToSection = (direction: "up" | "down") => {
    const targetIndex = direction === "up" 
      ? Math.max(0, currentIndex - 1)
      : Math.min(sections.length - 1, currentIndex + 1);
    
    const element = document.getElementById(sections[targetIndex].id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (sections.length <= 1) return null;

  return (
    <div
      className={cn(
        "fixed right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none",
        className
      )}
    >
      <div className="flex flex-col items-center gap-1 bg-card/90 backdrop-blur-md border border-border rounded-2xl p-1.5 shadow-lg">
        {/* Up Button */}
        <button
          onClick={() => scrollToSection("up")}
          disabled={currentIndex === 0}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
            "hover:bg-secondary active:scale-95",
            currentIndex === 0 && "opacity-30 cursor-not-allowed"
          )}
          aria-label="Previous section"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        {/* Section Indicator */}
        <div className="flex flex-col items-center py-2 px-1">
          <span className="text-xs font-bold text-foreground">
            {currentIndex + 1}
          </span>
          <div className="w-4 h-px bg-border my-1" />
          <span className="text-xs text-muted-foreground">
            {sections.length}
          </span>
        </div>

        {/* Down Button */}
        <button
          onClick={() => scrollToSection("down")}
          disabled={currentIndex === sections.length - 1}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
            "hover:bg-secondary active:scale-95",
            currentIndex === sections.length - 1 && "opacity-30 cursor-not-allowed"
          )}
          aria-label="Next section"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Section label tooltip */}
      <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <div className="bg-card border border-border rounded-lg px-3 py-1.5 shadow-md whitespace-nowrap">
          <p className="text-xs font-medium text-muted-foreground">
            {sections[currentIndex]?.label}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SectionNavigator;
