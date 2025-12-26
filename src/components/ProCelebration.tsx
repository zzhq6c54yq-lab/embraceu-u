import { useEffect, useState, useCallback } from "react";
import { usePremium } from "@/hooks/usePremium";
import { Crown, Sparkles, Diamond } from "lucide-react";
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
  type: "spark" | "diamond";
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
  const [phase, setPhase] = useState<"shake" | "explode" | "reveal" | "fade" | "done">("shake");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  const [showConfettiRain, setShowConfettiRain] = useState(false);

  const generateParticles = useCallback(() => {
    const sparkColors = [
      "hsl(40, 80%, 60%)",
      "hsl(35, 90%, 55%)",
      "hsl(45, 70%, 65%)",
      "hsl(30, 85%, 50%)",
      "hsl(50, 75%, 60%)",
      "hsl(42, 95%, 70%)",
    ];

    const diamondColors = [
      "hsl(40, 100%, 75%)",
      "hsl(45, 90%, 80%)",
      "hsl(38, 95%, 72%)",
    ];
    
    const newParticles: Particle[] = [];
    
    // Main spark particles - increased to 100
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: 50,
        y: 50,
        angle: (i / 100) * 360 + Math.random() * 20,
        speed: 18 + Math.random() * 30,
        size: 8 + Math.random() * 18,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        delay: Math.random() * 0.25,
        type: "spark",
      });
    }

    // Diamond particles - 20 luxury gems
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: 100 + i,
        x: 50,
        y: 50,
        angle: (i / 20) * 360 + Math.random() * 30,
        speed: 12 + Math.random() * 20,
        size: 14 + Math.random() * 10,
        color: diamondColors[Math.floor(Math.random() * diamondColors.length)],
        delay: Math.random() * 0.3 + 0.1,
        type: "diamond",
      });
    }

    setParticles(newParticles);
  }, []);

  const generateConfetti = useCallback(() => {
    const confettiColors = [
      "hsl(40, 90%, 60%)",
      "hsl(45, 85%, 65%)",
      "hsl(35, 95%, 55%)",
      "hsl(50, 80%, 70%)",
      "hsl(30, 90%, 50%)",
      "hsl(42, 100%, 75%)",
      "hsl(38, 85%, 62%)",
    ];

    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 80; i++) {
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
      setPhase("shake");
      setShowFlash(false);
      return;
    }

    generateParticles();
    generateConfetti();
    
    // Play celebration sound
    playCelebrationSequence();

    // Flash at explosion
    setTimeout(() => setShowFlash(true), 600);
    setTimeout(() => setShowFlash(false), 1200);

    // Start confetti rain at reveal
    setTimeout(() => setShowConfettiRain(true), 1500);

    // Phase timing - extended for more drama
    const shakeTimeout = setTimeout(() => setPhase("explode"), 900);
    const revealTimeout = setTimeout(() => setPhase("reveal"), 1800);
    const fadeTimeout = setTimeout(() => setPhase("fade"), 4000);
    const doneTimeout = setTimeout(() => {
      setPhase("done");
      completeCelebration();
    }, 4500);

    // Keep confetti going after celebration ends
    const confettiTimeout = setTimeout(() => setShowConfettiRain(false), 8000);

    return () => {
      clearTimeout(shakeTimeout);
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
            ${phase === "shake" ? "animate-screen-shake" : ""}
            ${phase === "explode" ? "animate-intense-rumble" : ""}
            ${phase === "fade" ? "animate-celebration-fade-out" : ""}
          `}
        >
          {/* Golden vignette overlay */}
          <div 
            className="absolute inset-0 transition-all duration-700 pointer-events-none"
            style={{
              background: phase === "reveal" || phase === "explode" 
                ? "radial-gradient(ellipse at center, transparent 30%, hsl(35, 70%, 15% / 0.8) 100%)"
                : "transparent"
            }}
          />

          {/* Dark overlay that transitions to gold */}
          <div 
            className={`absolute inset-0 transition-all duration-700
              ${phase === "shake" ? "bg-background/95" : ""}
              ${phase === "explode" || phase === "reveal" ? "bg-gradient-to-br from-amber-950/95 via-yellow-950/90 to-amber-900/95" : ""}
              ${phase === "fade" ? "bg-transparent" : ""}
            `}
          />

          {/* Flash burst effect */}
          {showFlash && (
            <div 
              className="absolute inset-0 z-50 animate-flash-burst"
              style={{
                background: "radial-gradient(circle at center, hsl(45, 100%, 85%) 0%, hsl(40, 90%, 60% / 0.5) 40%, transparent 70%)",
              }}
            />
          )}

          {/* Lens flare from crown */}
          {phase === "reveal" && (
            <>
              <div 
                className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full animate-lens-flare pointer-events-none"
                style={{
                  background: "radial-gradient(circle, hsl(45, 100%, 80% / 0.4) 0%, hsl(40, 80%, 60% / 0.2) 30%, transparent 60%)",
                }}
              />
              <div 
                className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full animate-lens-flare pointer-events-none"
                style={{
                  background: "radial-gradient(circle, hsl(40, 90%, 70% / 0.2) 0%, transparent 50%)",
                  animationDelay: "0.3s",
                }}
              />
            </>
          )}

          {/* Golden rays - more intense */}
          {(phase === "explode" || phase === "reveal") && (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-[250vmax] h-3 origin-left animate-golden-ray"
                  style={{
                    background: "linear-gradient(90deg, hsl(45, 80%, 60%) 0%, hsl(40, 70%, 50% / 0.5) 30%, transparent 100%)",
                    transform: `translate(-50%, -50%) rotate(${i * 22.5}deg)`,
                    animationDelay: `${i * 0.03}s`,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
          )}

          {/* Explosion particles */}
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
                  boxShadow: `0 0 ${particle.size * 2.5}px ${particle.color}, 0 0 ${particle.size * 4}px ${particle.color}`,
                  "--particle-angle": `${particle.angle}deg`,
                  "--particle-distance": `${particle.speed}vmax`,
                  animationDelay: `${particle.delay}s`,
                } as React.CSSProperties}
              />
            ) : (
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
            )
          ))}

          {/* Crown and text reveal */}
          {phase === "reveal" && (
            <div className="relative z-10 flex flex-col items-center animate-premium-reveal">
              {/* Larger crown with dramatic entrance */}
              <div 
                className="w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center animate-crown-entrance"
                style={{
                  background: "linear-gradient(135deg, hsl(45, 80%, 55%) 0%, hsl(40, 90%, 45%) 50%, hsl(35, 85%, 50%) 100%)",
                  boxShadow: "0 0 60px hsl(40 80% 50% / 0.7), 0 0 120px hsl(40 70% 50% / 0.4), inset 0 0 30px hsl(45 90% 70% / 0.3)",
                }}
              >
                <Crown 
                  className="w-20 h-20 md:w-24 md:h-24 text-amber-900" 
                  style={{
                    filter: "drop-shadow(0 4px 8px hsl(35, 70%, 30% / 0.5))",
                  }}
                />
              </div>
              
              <div className="mt-10 text-center">
                <div className="flex items-center justify-center gap-4 mb-5">
                  <Sparkles className="w-7 h-7 text-amber-300 animate-pulse" />
                  <Diamond className="w-5 h-5 text-amber-200 animate-diamond-float" style={{ animationDelay: "0.2s" }} />
                  <h1 
                    className="text-4xl md:text-6xl font-serif font-bold tracking-wider"
                    style={{
                      background: "linear-gradient(135deg, hsl(45, 90%, 75%) 0%, hsl(40, 100%, 85%) 50%, hsl(45, 90%, 75%) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textShadow: "0 0 40px hsl(40 80% 60% / 0.5)",
                      filter: "drop-shadow(0 2px 10px hsl(40 80% 50% / 0.3))",
                    }}
                  >
                    WELCOME TO PRO
                  </h1>
                  <Diamond className="w-5 h-5 text-amber-200 animate-diamond-float" style={{ animationDelay: "0.5s" }} />
                  <Sparkles className="w-7 h-7 text-amber-300 animate-pulse" />
                </div>
                <p 
                  className="text-xl md:text-2xl font-serif italic"
                  style={{
                    color: "hsl(40, 60%, 80%)",
                    textShadow: "0 0 20px hsl(40 50% 50% / 0.3)",
                  }}
                >
                  Your premium journey begins now
                </p>
              </div>
            </div>
          )}

          {/* Floating diamonds throughout */}
          {(phase === "explode" || phase === "reveal") && [...Array(12)].map((_, i) => (
            <Diamond
              key={`float-diamond-${i}`}
              className="absolute text-amber-200/60 animate-diamond-float"
              style={{
                left: `${8 + Math.random() * 84}%`,
                top: `${8 + Math.random() * 84}%`,
                width: 12 + Math.random() * 16,
                height: 12 + Math.random() * 16,
                animationDelay: `${Math.random() * 3}s`,
                filter: "drop-shadow(0 0 8px hsl(40 70% 60% / 0.5))",
              }}
            />
          ))}

          {/* Sparkle effects throughout - increased */}
          {(phase === "explode" || phase === "reveal") && [...Array(30)].map((_, i) => (
            <Sparkles
              key={`sparkle-${i}`}
              className="absolute text-amber-300 animate-sparkle-float"
              style={{
                left: `${5 + Math.random() * 90}%`,
                top: `${5 + Math.random() * 90}%`,
                width: 14 + Math.random() * 18,
                height: 14 + Math.random() * 18,
                animationDelay: `${Math.random() * 2.5}s`,
                opacity: 0.5 + Math.random() * 0.5,
                filter: "drop-shadow(0 0 6px hsl(45 80% 60% / 0.4))",
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ProCelebration;
