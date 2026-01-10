import { useEffect, useState, useCallback } from "react";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Sparkles, Heart, Sun, Feather, Moon, Wind, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCelebrationSound from "@/hooks/useCelebrationSound";
import NebulaBackground from "./NebulaBackground";
interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

// Rotating opening affirmations
const openingLines = [
  { main: "Today, you chose yourself.", sub: "That takes courage. That takes love." },
  { main: "Self-love isn't selfish.", sub: "It's survival. Welcome home." },
  { main: "You've taken the most important step.", sub: "Believing you're worth it." },
  { main: "Every journey to peace begins here.", sub: "With one brave, beautiful choice." },
];

// Affirmation sequence
const affirmations = [
  "Your peace matters",
  "Your growth is sacred", 
  "Your journey is honored here",
];

// Feature icons for orbital display
const featureIcons = [
  { Icon: Heart, label: "Unlimited Gratitude" },
  { Icon: Sparkles, label: "AI Coach" },
  { Icon: Sun, label: "Premium Themes" },
  { Icon: Feather, label: "Voice Journal" },
  { Icon: Moon, label: "Ad-Free Space" },
  { Icon: Wind, label: "Breathing Exercises" },
];

const ProCelebration = () => {
  const { showCelebration, completeCelebration, isTrial } = usePremium();
  const { user } = useAuth();
  const { playCelebrationSequence } = useCelebrationSound();
  
  const [phase, setPhase] = useState<"hidden" | "breathe" | "ascend" | "acknowledgment" | "affirmations" | "sanctuary" | "ready">("hidden");
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [nickname, setNickname] = useState<string | null>(null);
  const [openingLine] = useState(() => openingLines[Math.floor(Math.random() * openingLines.length)]);
  const [showLotus, setShowLotus] = useState(false);

  // Generate gentle floating particles - brighter colors for cosmic effect
  const generateParticles = useCallback(() => {
    const colors = [
      "hsl(320, 80%, 75%)",   // Bright pink
      "hsl(195, 90%, 70%)",   // Bright cyan
      "hsl(45, 90%, 75%)",    // Golden
      "hsl(280, 70%, 75%)",   // Purple
      "hsl(270, 60%, 80%)",   // Lavender
      "hsl(180, 80%, 65%)",   // Teal
    ];
    
    const newParticles: FloatingParticle[] = [];
    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: 100 + Math.random() * 20, // Start below viewport
        size: 2 + Math.random() * 5,
        delay: Math.random() * 4,
        duration: 8 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles(newParticles);
  }, []);

  // Fetch user's nickname
  useEffect(() => {
    const fetchNickname = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("user_id", user.id)
        .single();
      if (data?.nickname) {
        setNickname(data.nickname);
      }
    };
    fetchNickname();
  }, [user?.id]);

  // Main celebration sequence
  useEffect(() => {
    if (!showCelebration) {
      setPhase("hidden");
      setCurrentAffirmation(0);
      setShowLotus(false);
      return;
    }

    generateParticles();
    playCelebrationSequence();

    // Phase 1: Breathe (gentle fade in)
    const breatheTimer = setTimeout(() => setPhase("breathe"), 100);
    
    // Phase 2: Ascend (particles rise)
    const ascendTimer = setTimeout(() => setPhase("ascend"), 1500);
    
    // Phase 3: Acknowledgment (personal message)
    const ackTimer = setTimeout(() => setPhase("acknowledgment"), 3000);
    
    // Phase 4: Affirmations
    const affirmTimer = setTimeout(() => setPhase("affirmations"), 6000);
    const aff1 = setTimeout(() => setCurrentAffirmation(1), 8000);
    const aff2 = setTimeout(() => setCurrentAffirmation(2), 10000);
    
    // Phase 5: Sanctuary
    const sanctuaryTimer = setTimeout(() => {
      setPhase("sanctuary");
      setShowLotus(true);
    }, 12000);
    
    // Phase 6: Ready
    const readyTimer = setTimeout(() => setPhase("ready"), 14000);

    return () => {
      clearTimeout(breatheTimer);
      clearTimeout(ascendTimer);
      clearTimeout(ackTimer);
      clearTimeout(affirmTimer);
      clearTimeout(aff1);
      clearTimeout(aff2);
      clearTimeout(sanctuaryTimer);
      clearTimeout(readyTimer);
    };
  }, [showCelebration, generateParticles, playCelebrationSequence]);

  const handleContinue = () => {
    completeCelebration();
    setPhase("hidden");
  };

  if (phase === "hidden") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Cosmic nebula backdrop */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ease-out ${
          phase === "breathe" ? "opacity-0" : "opacity-100"
        }`}
        onClick={phase === "ready" ? handleContinue : undefined}
      >
        {/* AI-generated cosmic nebula background */}
        <NebulaBackground animated={phase !== "breathe"} />

        {/* Soft ambient glow at center */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full transition-all duration-2000 ${
            phase !== "breathe" ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            background: "radial-gradient(circle, hsl(320, 60%, 70% / 0.2) 0%, hsl(280, 50%, 60% / 0.1) 40%, transparent 70%)",
            animation: phase !== "breathe" ? "gentle-pulse 4s ease-in-out infinite" : "none",
          }}
        />

        {/* Floating light orbs - brighter cosmic colors */}
        {phase !== "breathe" && [...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${5 + i * 10}%`,
              top: `${10 + (i % 5) * 18}%`,
              width: 100 + i * 30,
              height: 100 + i * 30,
              background: i % 4 === 0
                ? "radial-gradient(circle, hsl(320, 70%, 65% / 0.15) 0%, transparent 70%)"
                : i % 4 === 1
                ? "radial-gradient(circle, hsl(195, 80%, 60% / 0.12) 0%, transparent 70%)"
                : i % 4 === 2
                ? "radial-gradient(circle, hsl(280, 60%, 65% / 0.12) 0%, transparent 70%)"
                : "radial-gradient(circle, hsl(45, 80%, 65% / 0.1) 0%, transparent 70%)",
              animation: "orb-drift 12s ease-in-out infinite",
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}

        {/* Rising particles - gentle ascension */}
        {phase !== "breathe" && particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${particle.x}%`,
              bottom: `-${particle.size}px`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              animation: `particle-rise ${particle.duration}s ease-out infinite`,
              animationDelay: `${particle.delay}s`,
              opacity: 0,
            }}
          />
        ))}

        {/* Soft star twinkles */}
        {phase !== "breathe" && [...Array(20)].map((_, i) => (
          <Star
            key={`star-${i}`}
            className="absolute pointer-events-none"
            fill="currentColor"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              width: 6 + Math.random() * 8,
              height: 6 + Math.random() * 8,
              color: `hsl(${45 + Math.random() * 30}, 30%, ${85 + Math.random() * 10}%)`,
              opacity: 0,
              animation: "star-twinkle 3s ease-in-out infinite",
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main content container with gentle breathing animation */}
      <div 
        className={`relative z-10 w-full max-w-xl transition-all duration-1000 ${
          phase === "acknowledgment" || phase === "affirmations" ? "scale-100" : "scale-100"
        }`}
        style={{
          animation: phase !== "breathe" && phase !== "ready" ? "gentle-breathe 4s ease-in-out infinite" : "none",
        }}
      >
        {/* Close button */}
        {phase === "ready" && (
          <button 
            onClick={handleContinue}
            className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all duration-300 z-20 backdrop-blur-sm"
            style={{
              animation: "fade-in 0.5s ease-out",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Phase 1-2: Initial glow with crown reveal */}
        {(phase === "breathe" || phase === "ascend") && (
          <div className="flex flex-col items-center justify-center">
            {/* Soft expanding glow */}
            <div 
              className={`relative transition-all duration-1500 ${
                phase === "ascend" ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
            >
              {/* Outer glow ring */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
                style={{
                  background: "radial-gradient(circle, hsl(270, 40%, 70% / 0.2) 0%, hsl(195, 50%, 70% / 0.1) 40%, transparent 70%)",
                  animation: "gentle-pulse 3s ease-in-out infinite",
                }}
              />
              
              {/* Crown with elegant reveal */}
              <div 
                className={`w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center transition-all duration-1000 ${
                  phase === "ascend" ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
                style={{
                  background: "linear-gradient(135deg, hsl(45, 20%, 95%) 0%, hsl(45, 25%, 88%) 30%, hsl(45, 20%, 80%) 60%, hsl(45, 25%, 90%) 100%)",
                  boxShadow: "0 0 80px hsl(45, 20%, 90% / 0.5), 0 0 150px hsl(270, 40%, 80% / 0.2)",
                }}
              >
                <Crown 
                  className="w-16 h-16 md:w-20 md:h-20" 
                  style={{
                    color: "hsl(225, 30%, 25%)",
                    filter: "drop-shadow(0 4px 12px hsl(225, 30%, 15% / 0.4))",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Personal Acknowledgment */}
        {(phase === "acknowledgment" || phase === "affirmations") && (
          <div 
            className={`text-center space-y-6 transition-all duration-700 ${
              phase === "affirmations" ? "opacity-0 scale-95 absolute inset-0" : "opacity-100"
            }`}
            style={{
              animation: phase === "acknowledgment" ? "fade-up 0.8s ease-out" : "none",
            }}
          >
            {/* Soft golden glow behind text */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(45, 40%, 75% / 0.12) 0%, transparent 60%)",
                animation: "gentle-pulse 3s ease-in-out infinite",
              }}
            />
            
            {/* Personalized greeting */}
            {nickname && (
              <p 
                className="text-xl md:text-2xl font-medium relative z-10"
                style={{ 
                  color: "hsl(45, 25%, 85%)",
                  animation: "fade-up 0.6s ease-out",
                }}
              >
                {nickname},
              </p>
            )}
            
            {/* Main acknowledgment */}
            <h1 
              className="text-3xl md:text-5xl font-light leading-tight relative z-10"
              style={{ 
                color: "hsl(45, 20%, 95%)",
                textShadow: "0 0 60px hsl(45, 30%, 80% / 0.3)",
                animation: "fade-up 0.8s ease-out",
                animationDelay: "0.2s",
                animationFillMode: "backwards",
              }}
            >
              {openingLine.main}
            </h1>
            
            {/* Sub text */}
            <p 
              className="text-lg md:text-xl font-light relative z-10"
              style={{ 
                color: "hsl(270, 20%, 80%)",
                animation: "fade-up 0.8s ease-out",
                animationDelay: "0.4s",
                animationFillMode: "backwards",
              }}
            >
              {openingLine.sub}
            </p>
          </div>
        )}

        {/* Phase 4: Affirmation Scroll */}
        {phase === "affirmations" && (
          <div 
            className="relative h-32 flex items-center justify-center"
            style={{
              animation: "fade-in 0.5s ease-out",
            }}
          >
            {affirmations.map((affirmation, index) => (
              <h2
                key={affirmation}
                className={`text-3xl md:text-5xl font-light absolute inset-0 flex items-center justify-center text-center transition-all duration-1000 ${
                  currentAffirmation === index ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
                style={{
                  color: "hsl(45, 20%, 95%)",
                  textShadow: "0 0 80px hsl(45, 30%, 80% / 0.4)",
                }}
              >
                {affirmation}
              </h2>
            ))}
          </div>
        )}

        {/* Phase 5 & 6: Sanctuary Welcome */}
        {(phase === "sanctuary" || phase === "ready") && (
          <div 
            className="text-center space-y-8"
            style={{
              animation: "fade-in 0.8s ease-out",
            }}
          >
            {/* Lotus bloom symbol */}
            {showLotus && (
              <div className="relative flex justify-center mb-8">
                <div 
                  className="relative"
                  style={{
                    animation: "lotus-bloom 1.5s ease-out forwards",
                  }}
                >
                  {/* Lotus container */}
                  <div 
                    className="w-32 h-32 md:w-40 md:h-40 relative"
                    style={{
                      filter: "drop-shadow(0 0 40px hsl(45, 40%, 80% / 0.4))",
                    }}
                  >
                    {/* Center */}
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
                      style={{
                        background: "radial-gradient(circle, hsl(45, 40%, 90%) 0%, hsl(45, 35%, 75%) 100%)",
                        boxShadow: "0 0 20px hsl(45, 40%, 80% / 0.6)",
                      }}
                    />
                    {/* Petals */}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-1/2 left-1/2 origin-bottom"
                        style={{
                          width: "20px",
                          height: "45px",
                          marginLeft: "-10px",
                          marginTop: "-45px",
                          transform: `rotate(${i * 45}deg)`,
                          animation: "petal-unfold 1s ease-out forwards",
                          animationDelay: `${i * 0.08}s`,
                          opacity: 0,
                        }}
                      >
                        <div 
                          className="w-full h-full rounded-full"
                          style={{
                            background: `linear-gradient(to top, hsl(${45 + i * 5}, 35%, 85%) 0%, hsl(${50 + i * 5}, 40%, 92%) 100%)`,
                            boxShadow: `0 0 15px hsl(45, 40%, 80% / 0.3)`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pulsing glow behind lotus */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
                  style={{
                    background: "radial-gradient(circle, hsl(320, 40%, 70% / 0.1) 0%, transparent 60%)",
                    animation: "gentle-pulse 3s ease-in-out infinite",
                  }}
                />
              </div>
            )}

            {/* Sanctuary text */}
            <div className="space-y-3">
              <h2 
                className="text-2xl md:text-4xl font-medium"
                style={{
                  background: "linear-gradient(135deg, hsl(45, 25%, 95%) 0%, hsl(45, 35%, 85%) 40%, hsl(270, 25%, 90%) 70%, hsl(45, 20%, 92%) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Welcome to your sanctuary
              </h2>
              <p 
                className="text-base md:text-lg"
                style={{ color: "hsl(220, 20%, 70%)" }}
              >
                {isTrial 
                  ? "Your 7-day journey of self-discovery begins"
                  : "A space created just for you"
                }
              </p>
            </div>

            {/* Orbital feature icons */}
            <div className="relative h-40 md:h-48 mt-8">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {featureIcons.map((feature, index) => {
                  const angle = (index / featureIcons.length) * 360;
                  const radius = 70;
                  return (
                    <div
                      key={feature.label}
                      className="absolute group"
                      style={{
                        left: 0,
                        top: 0,
                        transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
                        animation: "orbit-fade-in 0.6s ease-out forwards",
                        animationDelay: `${index * 0.1}s`,
                        opacity: 0,
                      }}
                    >
                      <div 
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                        style={{
                          background: "linear-gradient(135deg, hsl(225, 25%, 20% / 0.8) 0%, hsl(260, 20%, 15% / 0.9) 100%)",
                          border: "1px solid hsl(45, 20%, 80% / 0.15)",
                          boxShadow: "0 0 20px hsl(270, 30%, 60% / 0.15)",
                        }}
                      >
                        <feature.Icon 
                          className="w-5 h-5 md:w-6 md:h-6" 
                          style={{ color: "hsl(45, 25%, 85%)" }}
                        />
                      </div>
                      {/* Tooltip */}
                      <span 
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "hsl(220, 20%, 70%)" }}
                      >
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Button */}
            {phase === "ready" && (
              <div 
                className="pt-6"
                style={{
                  animation: "fade-up 0.6s ease-out",
                  animationDelay: "0.3s",
                  animationFillMode: "backwards",
                }}
              >
                <Button
                  onClick={handleContinue}
                  className="px-10 py-6 text-base md:text-lg font-medium tracking-wide rounded-full relative overflow-hidden group"
                  style={{
                    background: "linear-gradient(135deg, hsl(45, 25%, 92%) 0%, hsl(45, 30%, 85%) 50%, hsl(45, 25%, 90%) 100%)",
                    color: "hsl(225, 35%, 18%)",
                    border: "1px solid hsl(45, 25%, 88% / 0.5)",
                    boxShadow: "0 0 50px hsl(45, 25%, 85% / 0.3), 0 10px 40px hsl(225, 40%, 5% / 0.4)",
                  }}
                >
                  {/* Shimmer effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, hsl(45, 35%, 98% / 0.5) 50%, transparent 100%)",
                      animation: "shimmer-sweep 2.5s ease-in-out infinite",
                    }}
                  />
                  <span className="relative z-10">Enter your sanctuary</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline styles for animations */}
      <style>{`
        @keyframes aurora-wave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes gentle-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
        }
        
        @keyframes gentle-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0); opacity: 0.6; }
          33% { transform: translate(10px, -15px); opacity: 0.8; }
          66% { transform: translate(-5px, 10px); opacity: 0.7; }
        }
        
        @keyframes particle-rise {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          10% { opacity: 0.8; transform: translateY(0) scale(1); }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        
        @keyframes star-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 0.6; transform: scale(1); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes lotus-bloom {
          0% { opacity: 0; transform: scale(0.5) rotate(-20deg); }
          60% { opacity: 1; transform: scale(1.05) rotate(3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        
        @keyframes petal-unfold {
          0% { opacity: 0; transform: rotate(var(--rotation, 0deg)) scaleY(0); }
          100% { opacity: 1; transform: rotate(var(--rotation, 0deg)) scaleY(1); }
        }
        
        @keyframes orbit-fade-in {
          from { opacity: 0; transform: rotate(var(--angle, 0deg)) translateX(50px) rotate(calc(-1 * var(--angle, 0deg))) scale(0.8); }
          to { opacity: 1; transform: rotate(var(--angle, 0deg)) translateX(70px) rotate(calc(-1 * var(--angle, 0deg))) scale(1); }
        }
        
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ProCelebration;
