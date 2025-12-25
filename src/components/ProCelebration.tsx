import { useEffect, useState, useCallback } from "react";
import { usePremium } from "@/hooks/usePremium";
import { Crown, Sparkles } from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  delay: number;
}

const ProCelebration = () => {
  const { showCelebration, completeCelebration } = usePremium();
  const [phase, setPhase] = useState<"shake" | "explode" | "reveal" | "fade" | "done">("shake");
  const [particles, setParticles] = useState<Particle[]>([]);

  const generateParticles = useCallback(() => {
    const colors = [
      "hsl(40, 70%, 55%)",
      "hsl(35, 80%, 50%)",
      "hsl(45, 60%, 60%)",
      "hsl(30, 75%, 45%)",
      "hsl(50, 65%, 55%)",
    ];
    
    const newParticles: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: i,
        x: 50,
        y: 50,
        angle: (i / 60) * 360 + Math.random() * 30,
        speed: 15 + Math.random() * 25,
        size: 8 + Math.random() * 16,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3,
      });
    }
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (!showCelebration) {
      setPhase("shake");
      return;
    }

    generateParticles();

    // Phase timing
    const shakeTimeout = setTimeout(() => setPhase("explode"), 700);
    const revealTimeout = setTimeout(() => setPhase("reveal"), 1500);
    const fadeTimeout = setTimeout(() => setPhase("fade"), 3000);
    const doneTimeout = setTimeout(() => {
      setPhase("done");
      completeCelebration();
    }, 3500);

    return () => {
      clearTimeout(shakeTimeout);
      clearTimeout(revealTimeout);
      clearTimeout(fadeTimeout);
      clearTimeout(doneTimeout);
    };
  }, [showCelebration, completeCelebration, generateParticles]);

  if (!showCelebration) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden
        ${phase === "shake" ? "animate-screen-shake" : ""}
        ${phase === "fade" ? "animate-celebration-fade-out" : ""}
      `}
    >
      {/* Dark overlay that transitions to gold */}
      <div 
        className={`absolute inset-0 transition-all duration-700
          ${phase === "shake" ? "bg-background/90" : ""}
          ${phase === "explode" || phase === "reveal" ? "bg-gradient-to-br from-amber-900/95 via-yellow-900/90 to-amber-800/95" : ""}
          ${phase === "fade" ? "bg-transparent" : ""}
        `}
      />

      {/* Golden rays */}
      {(phase === "explode" || phase === "reveal") && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-[200vmax] h-2 origin-left animate-golden-ray"
              style={{
                background: "linear-gradient(90deg, hsl(40, 70%, 50%) 0%, transparent 100%)",
                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                animationDelay: `${i * 0.05}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      )}

      {/* Explosion particles */}
      {(phase === "explode" || phase === "reveal") && particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-explode-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            "--particle-angle": `${particle.angle}deg`,
            "--particle-distance": `${particle.speed}vmax`,
            animationDelay: `${particle.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Crown and text reveal */}
      {phase === "reveal" && (
        <div className="relative z-10 flex flex-col items-center animate-premium-reveal">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-2xl animate-crown-pulse">
            <Crown className="w-16 h-16 text-amber-900" />
          </div>
          
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-100 tracking-wider">
                WELCOME TO PRO
              </h1>
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <p className="text-amber-200/80 font-serif italic text-lg">
              Your premium journey begins now
            </p>
          </div>
        </div>
      )}

      {/* Sparkle effects throughout */}
      {(phase === "explode" || phase === "reveal") && [...Array(20)].map((_, i) => (
        <Sparkles
          key={`sparkle-${i}`}
          className="absolute text-amber-300 animate-sparkle-float"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            width: 16 + Math.random() * 16,
            height: 16 + Math.random() * 16,
            animationDelay: `${Math.random() * 2}s`,
            opacity: 0.6 + Math.random() * 0.4,
          }}
        />
      ))}
    </div>
  );
};

export default ProCelebration;