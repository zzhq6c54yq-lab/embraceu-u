import { useEffect, useState, useCallback } from "react";
import { usePremium } from "@/hooks/usePremium";
import { Crown, Sparkles, Diamond, Star } from "lucide-react";
import useCelebrationSound from "@/hooks/useCelebrationSound";

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  delay: number;
  type: "spark" | "diamond" | "star";
}

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotation: number;
  swayAmount: number;
}

const ProCelebration = () => {
  const { showCelebration, completeCelebration } = usePremium();
  const { playCelebrationSequence } = useCelebrationSound();
  const [phase, setPhase] = useState<"portal" | "explode" | "reveal" | "fade" | "done">("portal");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  const [showConfettiRain, setShowConfettiRain] = useState(false);

  const generateParticles = useCallback(() => {
    // Iridescent color palette - platinum, rose gold, soft purple, cyan
    const sparkColors = [
      "hsl(45, 20%, 90%)",    // Platinum white
      "hsl(15, 50%, 75%)",    // Rose gold
      "hsl(270, 60%, 80%)",   // Soft lavender
      "hsl(195, 70%, 75%)",   // Cyan
      "hsl(45, 40%, 85%)",    // Champagne
      "hsl(320, 50%, 80%)",   // Pink
    ];

    const diamondColors = [
      "hsl(45, 30%, 95%)",    // Pure white
      "hsl(270, 50%, 85%)",   // Iridescent purple
      "hsl(195, 60%, 85%)",   // Iridescent blue
    ];

    const starColors = [
      "hsl(45, 25%, 90%)",
      "hsl(200, 50%, 85%)",
      "hsl(280, 40%, 85%)",
    ];
    
    const newParticles: Particle[] = [];
    
    // Main spark particles - iridescent
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: 50,
        y: 50,
        angle: (i / 100) * 360 + Math.random() * 20,
        speed: 18 + Math.random() * 30,
        size: 6 + Math.random() * 14,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        delay: Math.random() * 0.25,
        type: "spark",
      });
    }

    // Diamond particles - pure and luminous
    for (let i = 0; i < 24; i++) {
      newParticles.push({
        id: 100 + i,
        x: 50,
        y: 50,
        angle: (i / 24) * 360 + Math.random() * 30,
        speed: 12 + Math.random() * 20,
        size: 14 + Math.random() * 12,
        color: diamondColors[Math.floor(Math.random() * diamondColors.length)],
        delay: Math.random() * 0.3 + 0.1,
        type: "diamond",
      });
    }

    // Star particles - magical accents
    for (let i = 0; i < 16; i++) {
      newParticles.push({
        id: 124 + i,
        x: 50,
        y: 50,
        angle: (i / 16) * 360 + Math.random() * 45,
        speed: 10 + Math.random() * 15,
        size: 18 + Math.random() * 10,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        delay: Math.random() * 0.4 + 0.15,
        type: "star",
      });
    }

    setParticles(newParticles);
  }, []);

  const generateConfetti = useCallback(() => {
    // Luxurious confetti palette
    const confettiColors = [
      "hsl(45, 25%, 90%)",    // Platinum
      "hsl(15, 45%, 75%)",    // Rose gold
      "hsl(270, 50%, 80%)",   // Lavender
      "hsl(195, 55%, 78%)",   // Soft cyan
      "hsl(320, 45%, 80%)",   // Pink
      "hsl(45, 40%, 85%)",    // Champagne
      "hsl(210, 30%, 85%)",   // Silver blue
    ];

    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 100; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
        size: 8 + Math.random() * 12,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rotation: Math.random() * 360,
        swayAmount: 20 + Math.random() * 40,
      });
    }
    setConfetti(pieces);
  }, []);

  useEffect(() => {
    if (!showCelebration) {
      setPhase("portal");
      setShowFlash(false);
      return;
    }

    generateParticles();
    generateConfetti();
    
    // Play celebration sound
    playCelebrationSequence();

    // Flash at portal opening
    setTimeout(() => setShowFlash(true), 800);
    setTimeout(() => setShowFlash(false), 1400);

    // Start confetti rain at reveal
    setTimeout(() => setShowConfettiRain(true), 1800);

    // Phase timing - extended for the 4-phase emotional journey
    const portalTimeout = setTimeout(() => setPhase("explode"), 1000);
    const revealTimeout = setTimeout(() => setPhase("reveal"), 2000);
    // Don't fade out - let ProRevealScreen take over seamlessly
    const fadeTimeout = setTimeout(() => setPhase("fade"), 3200);
    const doneTimeout = setTimeout(() => {
      setPhase("done");
      // Don't call completeCelebration here - ProRevealScreen handles it
    }, 3500);

    // Keep confetti going after celebration ends
    const confettiTimeout = setTimeout(() => setShowConfettiRain(false), 10000);

    return () => {
      clearTimeout(portalTimeout);
      clearTimeout(revealTimeout);
      clearTimeout(fadeTimeout);
      clearTimeout(doneTimeout);
      clearTimeout(confettiTimeout);
    };
  }, [showCelebration, completeCelebration, generateParticles, generateConfetti, playCelebrationSequence]);

  if (!showCelebration && !showConfettiRain) return null;

  return (
    <>
      {/* Confetti rain layer - persists after celebration */}
      {showConfettiRain && (
        <div className="fixed inset-0 z-[99] pointer-events-none overflow-hidden">
          {confetti.map((piece) => (
            <div
              key={piece.id}
              className="absolute animate-confetti-fall"
              style={{
                left: `${piece.x}%`,
                top: "-20px",
                width: piece.size,
                height: piece.size * 0.6,
                backgroundColor: piece.color,
                borderRadius: "2px",
                boxShadow: `0 0 ${piece.size / 2}px ${piece.color}`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                "--sway-amount": `${piece.swayAmount}px`,
                "--rotation": `${piece.rotation}deg`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Main celebration overlay */}
      {showCelebration && (
        <div 
          className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden
            ${phase === "portal" ? "animate-screen-shake" : ""}
            ${phase === "explode" ? "animate-intense-rumble" : ""}
            ${phase === "fade" ? "animate-celebration-fade-out" : ""}
          `}
        >
          {/* Deep navy vignette overlay */}
          <div 
            className="absolute inset-0 transition-all duration-700 pointer-events-none"
            style={{
              background: phase === "reveal" || phase === "explode" 
                ? "radial-gradient(ellipse at center, transparent 20%, hsl(225, 40%, 8% / 0.9) 100%)"
                : "transparent"
            }}
          />

          {/* Dark overlay with elegant gradient */}
          <div 
            className={`absolute inset-0 transition-all duration-700
              ${phase === "portal" ? "bg-background/98" : ""}
              ${phase === "explode" || phase === "reveal" ? "bg-gradient-to-br from-[hsl(225,35%,8%)] via-[hsl(260,30%,12%)] to-[hsl(225,40%,6%)]" : ""}
              ${phase === "fade" ? "bg-transparent" : ""}
            `}
          />

          {/* Portal ring effect */}
          {phase === "portal" && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 rounded-full border-4 border-white/20 animate-portal-ring" 
                style={{ boxShadow: "0 0 60px hsl(270, 50%, 70% / 0.4), inset 0 0 40px hsl(195, 60%, 70% / 0.3)" }}
              />
              <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-white/10 animate-portal-ring" 
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          )}

          {/* Flash burst effect - white/platinum */}
          {showFlash && (
            <div 
              className="absolute inset-0 z-50 animate-flash-burst"
              style={{
                background: "radial-gradient(circle at center, hsl(45, 20%, 98%) 0%, hsl(270, 30%, 85% / 0.5) 40%, transparent 70%)",
              }}
            />
          )}

          {/* Ethereal lens flares */}
          {phase === "reveal" && (
            <>
              <div 
                className="absolute top-1/2 left-1/2 w-[350px] h-[350px] rounded-full animate-lens-flare pointer-events-none"
                style={{
                  background: "radial-gradient(circle, hsl(45, 25%, 95% / 0.3) 0%, hsl(270, 40%, 80% / 0.15) 40%, transparent 70%)",
                }}
              />
              <div 
                className="absolute top-1/2 left-1/2 w-[550px] h-[550px] rounded-full animate-lens-flare pointer-events-none"
                style={{
                  background: "radial-gradient(circle, hsl(195, 50%, 85% / 0.15) 0%, transparent 50%)",
                  animationDelay: "0.3s",
                }}
              />
            </>
          )}

          {/* Ethereal light rays - platinum and iridescent */}
          {(phase === "explode" || phase === "reveal") && (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-[250vmax] h-2 origin-left animate-golden-ray"
                  style={{
                    background: i % 3 === 0 
                      ? "linear-gradient(90deg, hsl(45, 25%, 90%) 0%, hsl(45, 20%, 85% / 0.4) 30%, transparent 100%)"
                      : i % 3 === 1
                      ? "linear-gradient(90deg, hsl(270, 40%, 85%) 0%, hsl(270, 30%, 75% / 0.3) 30%, transparent 100%)"
                      : "linear-gradient(90deg, hsl(195, 50%, 85%) 0%, hsl(195, 40%, 75% / 0.3) 30%, transparent 100%)",
                    transform: `translate(-50%, -50%) rotate(${i * 18}deg)`,
                    animationDelay: `${i * 0.025}s`,
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
          )}

          {/* Floating orbs - ambient background */}
          {(phase === "explode" || phase === "reveal") && [...Array(8)].map((_, i) => (
            <div
              key={`orb-${i}`}
              className="absolute rounded-full animate-orb-float pointer-events-none"
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${15 + Math.random() * 70}%`,
                width: 80 + Math.random() * 60,
                height: 80 + Math.random() * 60,
                background: i % 2 === 0
                  ? "radial-gradient(circle, hsl(270, 40%, 80% / 0.15) 0%, transparent 70%)"
                  : "radial-gradient(circle, hsl(195, 50%, 80% / 0.12) 0%, transparent 70%)",
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}

          {/* Explosion particles - iridescent */}
          {(phase === "explode" || phase === "reveal") && particles.map((particle) => (
            particle.type === "spark" ? (
              <div
                key={particle.id}
                className="absolute rounded-full animate-explode-particle"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}, 0 0 ${particle.size * 3}px ${particle.color}`,
                  "--particle-angle": `${particle.angle}deg`,
                  "--particle-distance": `${particle.speed}vmax`,
                  animationDelay: `${particle.delay}s`,
                } as React.CSSProperties}
              />
            ) : particle.type === "diamond" ? (
              <Diamond
                key={particle.id}
                className="absolute animate-explode-particle"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  color: particle.color,
                  filter: `drop-shadow(0 0 ${particle.size}px ${particle.color})`,
                  "--particle-angle": `${particle.angle}deg`,
                  "--particle-distance": `${particle.speed * 0.8}vmax`,
                  animationDelay: `${particle.delay}s`,
                } as React.CSSProperties}
              />
            ) : (
              <Star
                key={particle.id}
                className="absolute animate-explode-particle"
                fill="currentColor"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  color: particle.color,
                  filter: `drop-shadow(0 0 ${particle.size * 0.8}px ${particle.color})`,
                  "--particle-angle": `${particle.angle}deg`,
                  "--particle-distance": `${particle.speed * 0.6}vmax`,
                  animationDelay: `${particle.delay}s`,
                } as React.CSSProperties}
              />
            )
          ))}

          {/* Crown and text reveal */}
          {phase === "reveal" && (
            <div className="relative z-10 flex flex-col items-center animate-premium-reveal">
              {/* Luxurious crown with platinum styling */}
              <div 
                className="w-44 h-44 md:w-52 md:h-52 rounded-full flex items-center justify-center animate-crown-entrance"
                style={{
                  background: "linear-gradient(135deg, hsl(45, 20%, 95%) 0%, hsl(45, 25%, 88%) 30%, hsl(45, 20%, 80%) 60%, hsl(45, 25%, 90%) 100%)",
                  boxShadow: "0 0 80px hsl(45, 20%, 90% / 0.6), 0 0 150px hsl(270, 40%, 80% / 0.3), inset 0 0 40px hsl(45, 30%, 95% / 0.5)",
                }}
              >
                <Crown 
                  className="w-22 h-22 md:w-26 md:h-26" 
                  style={{
                    color: "hsl(225, 30%, 25%)",
                    filter: "drop-shadow(0 4px 12px hsl(225, 30%, 15% / 0.4))",
                    width: "5.5rem",
                    height: "5.5rem",
                  }}
                />
              </div>
              
              <div className="mt-10 text-center">
                <div className="flex items-center justify-center gap-4 mb-5">
                  <Sparkles className="w-6 h-6 text-white/80 animate-pulse" />
                  <Diamond className="w-5 h-5 text-white/60 animate-diamond-float" style={{ animationDelay: "0.2s" }} />
                  <h1 
                    className="text-4xl md:text-6xl font-serif font-bold tracking-wider"
                    style={{
                      background: "linear-gradient(135deg, hsl(45, 20%, 98%) 0%, hsl(45, 30%, 90%) 30%, hsl(270, 30%, 92%) 60%, hsl(45, 20%, 95%) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textShadow: "0 0 60px hsl(45, 20%, 90% / 0.5)",
                      filter: "drop-shadow(0 2px 15px hsl(45, 20%, 80% / 0.4))",
                    }}
                  >
                    WELCOME
                  </h1>
                  <Diamond className="w-5 h-5 text-white/60 animate-diamond-float" style={{ animationDelay: "0.5s" }} />
                  <Sparkles className="w-6 h-6 text-white/80 animate-pulse" />
                </div>
                <p 
                  className="text-xl md:text-2xl font-serif italic"
                  style={{
                    color: "hsl(270, 20%, 85%)",
                    textShadow: "0 0 30px hsl(270, 30%, 70% / 0.3)",
                  }}
                >
                  You've taken a powerful step for your mind
                </p>
              </div>
            </div>
          )}

          {/* Floating diamonds throughout */}
          {(phase === "explode" || phase === "reveal") && [...Array(16)].map((_, i) => (
            <Diamond
              key={`float-diamond-${i}`}
              className="absolute animate-diamond-float"
              style={{
                left: `${8 + Math.random() * 84}%`,
                top: `${8 + Math.random() * 84}%`,
                width: 10 + Math.random() * 14,
                height: 10 + Math.random() * 14,
                color: i % 3 === 0 ? "hsl(45, 20%, 90% / 0.5)" : i % 3 === 1 ? "hsl(270, 40%, 85% / 0.4)" : "hsl(195, 50%, 85% / 0.4)",
                animationDelay: `${Math.random() * 3}s`,
                filter: "drop-shadow(0 0 8px currentColor)",
              }}
            />
          ))}

          {/* Sparkle effects throughout */}
          {(phase === "explode" || phase === "reveal") && [...Array(35)].map((_, i) => (
            <Sparkles
              key={`sparkle-${i}`}
              className="absolute animate-sparkle-float"
              style={{
                left: `${5 + Math.random() * 90}%`,
                top: `${5 + Math.random() * 90}%`,
                width: 12 + Math.random() * 16,
                height: 12 + Math.random() * 16,
                color: i % 2 === 0 ? "hsl(45, 25%, 92%)" : "hsl(270, 35%, 88%)",
                animationDelay: `${Math.random() * 2.5}s`,
                opacity: 0.4 + Math.random() * 0.4,
                filter: "drop-shadow(0 0 6px currentColor)",
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ProCelebration;
