import { useState, useEffect } from "react";
import logoImage from "@/assets/logo-embrace.png";
import thriveMtIcon from "@/assets/thrive-mt-icon.png";

interface SplashScreenProps {
  onDismiss: () => void;
}

const SplashScreen = ({ onDismiss }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    // Small delay for fade out animation
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  if (!isVisible) {
    return (
      <div 
        className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center cursor-pointer opacity-0 transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center cursor-pointer transition-opacity duration-300"
      onClick={handleDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleDismiss();
        }
      }}
      aria-label="Tap to continue"
    >
      {/* Logo */}
      <div className="w-[70vw] max-w-[400px] mb-8">
        <img
          src={logoImage}
          alt="EmbraceU logo - hands embracing a heart"
          className="w-full h-auto object-contain drop-shadow-lg"
        />
      </div>

      {/* Tagline */}
      <p className="text-lg md:text-xl tracking-[0.2em] uppercase text-muted-foreground font-medium text-center mb-4">
        THE POWER OF PRESENCE
      </p>

      {/* By Thrive MT */}
      <p 
        className="text-sm md:text-base text-muted-foreground/80 flex items-center gap-2" 
        style={{ 
          fontFamily: "'DM Sans', sans-serif",
          textShadow: "0 1px 8px hsl(210 30% 50% / 0.25)"
        }}
      >
        by Thrive MT
        <img 
          src={thriveMtIcon} 
          alt="Thrive MT" 
          className="w-5 h-5 object-contain drop-shadow-md" 
        />
      </p>

      {/* Subtle tap hint */}
      <p className="absolute bottom-8 text-xs text-muted-foreground/50 uppercase tracking-wider">
        Tap anywhere to continue
      </p>
    </div>
  );
};

export default SplashScreen;
