import { useEffect, useState } from "react";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Heart, Sun, Feather, Moon, Wind, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const ProRevealScreen = () => {
  const { showCelebration, completeCelebration, isTrial } = usePremium();
  const { user } = useAuth();
  const [phase, setPhase] = useState<"hidden" | "acknowledgment" | "affirmations" | "sanctuary" | "ready">("hidden");
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [nickname, setNickname] = useState<string | null>(null);
  const [openingLine] = useState(() => openingLines[Math.floor(Math.random() * openingLines.length)]);
  const [showLotus, setShowLotus] = useState(false);

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

  useEffect(() => {
    if (showCelebration) {
      // Phase 1: Personal Acknowledgment (after explosion)
      const ackTimer = setTimeout(() => {
        setPhase("acknowledgment");
      }, 3500);

      // Phase 2: Affirmation Scroll
      const affirmTimer = setTimeout(() => {
        setPhase("affirmations");
      }, 6000);

      // Cycle through affirmations
      const aff1 = setTimeout(() => setCurrentAffirmation(1), 8000);
      const aff2 = setTimeout(() => setCurrentAffirmation(2), 10000);

      // Phase 3: Sanctuary Welcome
      const sanctuaryTimer = setTimeout(() => {
        setPhase("sanctuary");
        setShowLotus(true);
      }, 12000);

      // Phase 4: Ready
      const readyTimer = setTimeout(() => {
        setPhase("ready");
      }, 14000);

      return () => {
        clearTimeout(ackTimer);
        clearTimeout(affirmTimer);
        clearTimeout(aff1);
        clearTimeout(aff2);
        clearTimeout(sanctuaryTimer);
        clearTimeout(readyTimer);
      };
    } else {
      setPhase("hidden");
      setCurrentAffirmation(0);
      setShowLotus(false);
    }
  }, [showCelebration]);

  const handleContinue = () => {
    completeCelebration();
    setPhase("hidden");
  };

  if (phase === "hidden") return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
      {/* Deep elegant backdrop with aurora effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, hsl(225, 35%, 6%) 0%, hsl(260, 30%, 8%) 30%, hsl(280, 25%, 10%) 60%, hsl(225, 40%, 5%) 100%)",
        }}
        onClick={phase === "ready" ? handleContinue : undefined}
      >
        {/* Aurora wave effect */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div 
            className="absolute inset-0 animate-aurora-wave"
            style={{
              background: "linear-gradient(45deg, transparent 30%, hsl(270, 50%, 50% / 0.1) 45%, hsl(195, 60%, 50% / 0.08) 55%, transparent 70%)",
              backgroundSize: "400% 400%",
            }}
          />
          <div 
            className="absolute inset-0 animate-aurora-wave"
            style={{
              background: "linear-gradient(-45deg, transparent 30%, hsl(320, 40%, 50% / 0.08) 45%, hsl(45, 50%, 50% / 0.06) 55%, transparent 70%)",
              backgroundSize: "400% 400%",
              animationDelay: "2s",
            }}
          />
        </div>

        {/* Floating light orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-orb-float pointer-events-none"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
              width: 80 + i * 25,
              height: 80 + i * 25,
              background: i % 3 === 0
                ? "radial-gradient(circle, hsl(270, 45%, 65% / 0.1) 0%, transparent 70%)"
                : i % 3 === 1
                ? "radial-gradient(circle, hsl(195, 55%, 65% / 0.08) 0%, transparent 70%)"
                : "radial-gradient(circle, hsl(45, 40%, 70% / 0.06) 0%, transparent 70%)",
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${12 + i * 2}s`,
            }}
          />
        ))}

        {/* Gentle particle mist */}
        <div className="absolute inset-0 overflow-hidden opacity-25">
          {[...Array(40)].map((_, i) => (
            <div
              key={`mist-${i}`}
              className="absolute w-1 h-1 rounded-full bg-white/50 animate-particle-mist"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${10 + Math.random() * 6}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Breathing container - gentle pulse */}
      <div 
        className={`relative z-10 w-full max-w-xl transition-all duration-1000 ${
          phase === "acknowledgment" || phase === "affirmations" ? "animate-breathing" : ""
        }`}
      >
        {/* Close button */}
        {phase === "ready" && (
          <button 
            onClick={handleContinue}
            className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors z-20 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Phase 1: Personal Acknowledgment */}
        {(phase === "acknowledgment" || phase === "affirmations") && (
          <div className={`text-center space-y-6 transition-all duration-700 ${phase === "affirmations" ? "opacity-0 scale-95" : "opacity-100"}`}>
            {/* Golden light emanating from center */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full animate-heartbeat-glow"
              style={{
                background: "radial-gradient(circle, hsl(45, 40%, 75% / 0.15) 0%, hsl(45, 30%, 60% / 0.05) 40%, transparent 70%)",
              }}
            />
            
            {/* Personalized greeting */}
            {nickname && (
              <p 
                className="text-xl md:text-2xl font-serif italic animate-text-fade-up"
                style={{ color: "hsl(45, 25%, 85%)" }}
              >
                {nickname},
              </p>
            )}
            
            {/* Main acknowledgment */}
            <h1 
              className="text-3xl md:text-5xl font-serif font-light leading-tight animate-text-fade-up"
              style={{ 
                color: "hsl(45, 20%, 95%)",
                animationDelay: "0.3s",
                textShadow: "0 0 60px hsl(45, 30%, 80% / 0.3)",
              }}
            >
              {openingLine.main}
            </h1>
            
            {/* Sub text */}
            <p 
              className="text-lg md:text-xl font-serif italic animate-text-fade-up"
              style={{ 
                color: "hsl(270, 20%, 80%)",
                animationDelay: "0.6s",
              }}
            >
              {openingLine.sub}
            </p>
          </div>
        )}

        {/* Phase 2: Affirmation Scroll */}
        {phase === "affirmations" && (
          <div className="text-center animate-fade-in">
            {affirmations.map((affirmation, index) => (
              <h2
                key={affirmation}
                className={`text-3xl md:text-5xl font-serif font-light transition-all duration-1000 absolute inset-0 flex items-center justify-center ${
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

        {/* Phase 3 & 4: Sanctuary Welcome */}
        {(phase === "sanctuary" || phase === "ready") && (
          <div className="text-center space-y-8 animate-fade-in">
            {/* Lotus bloom symbol */}
            {showLotus && (
              <div className="relative flex justify-center mb-8">
                <div className="relative animate-lotus-bloom">
                  {/* Lotus petals using CSS */}
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
                        className="absolute top-1/2 left-1/2 origin-bottom animate-petal-unfold"
                        style={{
                          width: "20px",
                          height: "45px",
                          marginLeft: "-10px",
                          marginTop: "-45px",
                          transform: `rotate(${i * 45}deg)`,
                          animationDelay: `${i * 0.1}s`,
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
                
                {/* Pulsing heart glow behind lotus */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full animate-heartbeat-glow"
                  style={{
                    background: "radial-gradient(circle, hsl(320, 40%, 70% / 0.1) 0%, transparent 60%)",
                  }}
                />
              </div>
            )}

            {/* Sanctuary text */}
            <div className="space-y-3">
              <h2 
                className="text-2xl md:text-4xl font-serif italic"
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
                  const radius = 70; // radius in pixels
                  return (
                    <div
                      key={feature.label}
                      className="absolute animate-orbit group"
                      style={{
                        left: 0,
                        top: 0,
                        transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
                        animationDelay: `${index * 0.15}s`,
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
                      {/* Tooltip on hover */}
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
              <div className="pt-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <Button
                  onClick={handleContinue}
                  className="px-10 py-6 text-base md:text-lg font-serif italic tracking-wide rounded-full relative overflow-hidden group"
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

      <style>{`
        @keyframes text-fade-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes breathing {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        
        @keyframes aurora-wave {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes heartbeat-glow {
          0%, 100% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        
        @keyframes lotus-bloom {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-30deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        
        @keyframes petal-unfold {
          0% {
            opacity: 0;
            transform: rotate(var(--rotation, 0deg)) scaleY(0);
          }
          100% {
            opacity: 1;
            transform: rotate(var(--rotation, 0deg)) scaleY(1);
          }
        }
        
        @keyframes orbit {
          0% {
            opacity: 0;
            transform: rotate(var(--start-angle, 0deg)) translateX(0) rotate(calc(-1 * var(--start-angle, 0deg)));
          }
          100% {
            opacity: 1;
            transform: rotate(var(--start-angle, 0deg)) translateX(70px) rotate(calc(-1 * var(--start-angle, 0deg)));
          }
        }
        
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-text-fade-up {
          animation: text-fade-up 1s ease-out forwards;
          opacity: 0;
        }
        
        .animate-breathing {
          animation: breathing 4s ease-in-out infinite;
        }
        
        .animate-aurora-wave {
          animation: aurora-wave 15s ease-in-out infinite;
        }
        
        .animate-heartbeat-glow {
          animation: heartbeat-glow 3s ease-in-out infinite;
        }
        
        .animate-lotus-bloom {
          animation: lotus-bloom 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .animate-petal-unfold {
          animation: petal-unfold 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-orbit {
          animation: orbit 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default ProRevealScreen;