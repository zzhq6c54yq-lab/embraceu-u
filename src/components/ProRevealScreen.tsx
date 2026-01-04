import { useEffect, useState } from "react";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Sparkles, Diamond, Star, Check, X, Heart, Zap, Headphones, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Sparkles, text: "Your Peaceful, Uninterrupted Space", description: "Ad-free sanctuary" },
  { icon: Diamond, text: "Curated Visual Experiences", description: "Premium themes" },
  { icon: Heart, text: "Boundless Room for Gratitude", description: "Unlimited journaling" },
  { icon: Zap, text: "Personal AI Wellness Guide", description: "Smart insights" },
  { icon: Headphones, text: "Speak Your Truth Freely", description: "Voice journaling" },
  { icon: FileText, text: "Beautiful Progress Reports", description: "PDF exports" },
];

const headlines = [
  "You've Taken a Powerful Step",
  "Your Mental Wellness Elevated",
  "Welcome to Your Sanctuary",
  "Something Beautiful Awaits",
];

const ProRevealScreen = () => {
  const { showCelebration, completeCelebration, isTrial } = usePremium();
  const { user } = useAuth();
  const [phase, setPhase] = useState<"hidden" | "intro" | "features" | "ready">("hidden");
  const [featuresVisible, setFeaturesVisible] = useState<number[]>([]);
  const [nickname, setNickname] = useState<string | null>(null);
  const [headline] = useState(() => headlines[Math.floor(Math.random() * headlines.length)]);

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
      // Wait for explosion celebration, then show reveal
      const introTimer = setTimeout(() => {
        setPhase("intro");
      }, 3000);

      const featuresTimer = setTimeout(() => {
        setPhase("features");
        // Stagger feature reveals
        features.forEach((_, index) => {
          setTimeout(() => {
            setFeaturesVisible(prev => [...prev, index]);
          }, 200 + index * 180);
        });
      }, 4500);

      const readyTimer = setTimeout(() => {
        setPhase("ready");
      }, 6500);

      return () => {
        clearTimeout(introTimer);
        clearTimeout(featuresTimer);
        clearTimeout(readyTimer);
      };
    } else {
      setPhase("hidden");
      setFeaturesVisible([]);
    }
  }, [showCelebration]);

  const handleContinue = () => {
    completeCelebration();
    setPhase("hidden");
    setFeaturesVisible([]);
  };

  if (phase === "hidden") return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
      {/* Deep navy backdrop with orbs */}
      <div 
        className="absolute inset-0 animate-fade-in"
        style={{
          background: "linear-gradient(135deg, hsl(225, 35%, 8%) 0%, hsl(260, 30%, 10%) 50%, hsl(225, 40%, 6%) 100%)",
        }}
        onClick={phase === "ready" ? handleContinue : undefined}
      >
        {/* Floating ambient orbs */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-orb-float pointer-events-none"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              width: 100 + i * 30,
              height: 100 + i * 30,
              background: i % 2 === 0
                ? "radial-gradient(circle, hsl(270, 40%, 60% / 0.08) 0%, transparent 70%)"
                : "radial-gradient(circle, hsl(195, 50%, 60% / 0.06) 0%, transparent 70%)",
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}

        {/* Particle mist effect */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {[...Array(30)].map((_, i) => (
            <div
              key={`mist-${i}`}
              className="absolute w-1 h-1 rounded-full bg-white/40 animate-particle-mist"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-lg transition-all duration-700 animate-reveal-card">
        <div 
          className="relative overflow-hidden rounded-3xl p-6 md:p-8"
          style={{
            background: "linear-gradient(135deg, hsl(225, 30%, 15% / 0.95) 0%, hsl(260, 25%, 12% / 0.98) 50%, hsl(225, 35%, 10% / 0.95) 100%)",
            border: "1px solid hsl(45, 20%, 80% / 0.15)",
            boxShadow: "0 0 80px hsl(270, 40%, 60% / 0.15), 0 25px 80px hsl(225, 40%, 5% / 0.6), inset 0 1px 0 hsl(45, 20%, 90% / 0.1)",
          }}
        >
          {/* Platinum accent line at top */}
          <div 
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent 0%, hsl(45, 20%, 85% / 0.4) 30%, hsl(45, 25%, 90% / 0.6) 50%, hsl(45, 20%, 85% / 0.4) 70%, transparent 100%)",
            }}
          />
          
          {/* Close button */}
          {phase === "ready" && (
            <button 
              onClick={handleContinue}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {/* Decorative floating elements */}
          <Diamond className="absolute top-6 left-6 w-4 h-4 text-white/20 animate-sparkle-float" />
          <Star className="absolute top-12 right-12 w-3 h-3 text-white/15 animate-sparkle-float fill-current" style={{ animationDelay: "0.8s" }} />
          <Sparkles className="absolute bottom-20 right-6 w-5 h-5 text-white/15 animate-sparkle-float" style={{ animationDelay: "0.5s" }} />

          {/* Content */}
          <div className="relative z-10 text-center space-y-6">
            {/* Membership emblem */}
            <div className="flex justify-center mb-4 transition-all duration-700 animate-badge-reveal">
              <div 
                className="w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(45, 20%, 92%) 0%, hsl(45, 25%, 85%) 40%, hsl(45, 20%, 78%) 70%, hsl(45, 25%, 88%) 100%)",
                  boxShadow: "0 0 60px hsl(45, 20%, 85% / 0.4), 0 0 100px hsl(270, 40%, 70% / 0.2), inset 0 2px 10px hsl(45, 30%, 95% / 0.5)",
                  border: "2px solid hsl(45, 25%, 80% / 0.3)",
                }}
              >
                <Crown 
                  className="w-14 h-14 md:w-16 md:h-16" 
                  style={{ color: "hsl(225, 30%, 25%)" }}
                />
              </div>
            </div>
            
            {/* Welcome text */}
            <div className="space-y-3 transition-all duration-700 animate-text-fade-up" style={{ animationDelay: "0.3s" }}>
              {/* Personalized greeting */}
              {nickname && (
                <p 
                  className="text-lg font-serif italic"
                  style={{ color: "hsl(270, 25%, 80%)" }}
                >
                  Welcome, {nickname}
                </p>
              )}
              
              <h1 
                className="text-2xl md:text-3xl font-serif font-bold"
                style={{
                  background: "linear-gradient(135deg, hsl(45, 20%, 95%) 0%, hsl(45, 30%, 88%) 40%, hsl(270, 25%, 90%) 70%, hsl(45, 20%, 92%) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {headline}
              </h1>
              
              <p 
                className="text-sm md:text-base font-serif"
                style={{ color: "hsl(220, 20%, 70%)" }}
              >
                {isTrial 
                  ? "Your 7-day Pro experience has begun"
                  : "Your commitment to self-care is inspiring"
                }
              </p>
            </div>
            
            {/* Premium separator */}
            <div 
              className="h-px mx-auto w-3/4"
              style={{
                background: "linear-gradient(90deg, transparent 0%, hsl(45, 20%, 70% / 0.3) 30%, hsl(45, 25%, 80% / 0.4) 50%, hsl(45, 20%, 70% / 0.3) 70%, transparent 100%)",
              }}
            />
            
            {/* Benefits showcase */}
            {phase === "features" || phase === "ready" ? (
              <div className="space-y-3 text-left max-h-[280px] overflow-y-auto custom-scrollbar">
                <p 
                  className="text-xs text-center font-medium uppercase tracking-widest mb-4"
                  style={{ color: "hsl(270, 20%, 65%)" }}
                >
                  Your New Benefits
                </p>
                {features.map((feature, index) => (
                  <div 
                    key={feature.text}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl transition-all duration-500
                      ${featuresVisible.includes(index) 
                        ? "opacity-100 translate-x-0" 
                        : "opacity-0 -translate-x-6"
                      }
                    `}
                    style={{
                      background: featuresVisible.includes(index) 
                        ? "linear-gradient(90deg, hsl(45, 20%, 85% / 0.06) 0%, transparent 100%)"
                        : "transparent",
                      border: featuresVisible.includes(index) 
                        ? "1px solid hsl(45, 20%, 80% / 0.1)"
                        : "1px solid transparent",
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, hsl(45, 20%, 90% / 0.15) 0%, hsl(270, 30%, 80% / 0.08) 100%)",
                        border: "1px solid hsl(45, 20%, 80% / 0.15)",
                      }}
                    >
                      <feature.icon 
                        className="w-5 h-5" 
                        style={{ color: "hsl(45, 25%, 85%)" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span 
                        className="text-sm font-medium block truncate"
                        style={{ color: "hsl(45, 15%, 90%)" }}
                      >
                        {feature.text}
                      </span>
                      <span 
                        className="text-xs block"
                        style={{ color: "hsl(220, 15%, 55%)" }}
                      >
                        {feature.description}
                      </span>
                    </div>
                    <Check 
                      className="w-4 h-4 flex-shrink-0" 
                      style={{ color: "hsl(150, 50%, 60%)" }}
                    />
                  </div>
                ))}
              </div>
            ) : null}
            
            {/* CTA Button */}
            {phase === "ready" && (
              <div className="pt-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <Button
                  onClick={handleContinue}
                  className="w-full py-6 text-base font-semibold tracking-wide rounded-full relative overflow-hidden group"
                  style={{
                    background: "linear-gradient(135deg, hsl(45, 20%, 90%) 0%, hsl(45, 25%, 82%) 50%, hsl(45, 20%, 88%) 100%)",
                    color: "hsl(225, 35%, 18%)",
                    border: "1px solid hsl(45, 25%, 85% / 0.5)",
                    boxShadow: "0 0 40px hsl(45, 20%, 80% / 0.3), 0 8px 30px hsl(225, 40%, 5% / 0.4)",
                  }}
                >
                  {/* Shimmer effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, hsl(45, 30%, 95% / 0.4) 50%, transparent 100%)",
                      animation: "shimmer-sweep 2s ease-in-out infinite",
                    }}
                  />
                  <Sparkles className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10">Begin Your Enhanced Journey</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes reveal-card {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(30px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes badge-reveal {
          0% {
            opacity: 0;
            transform: scale(0) rotateY(-180deg);
          }
          60% {
            opacity: 1;
            transform: scale(1.1) rotateY(-15deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateY(0deg);
          }
        }
        
        @keyframes text-fade-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-reveal-card {
          animation: reveal-card 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .animate-badge-reveal {
          animation: badge-reveal 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .animate-text-fade-up {
          animation: text-fade-up 0.7s ease-out forwards;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(45, 20%, 60% / 0.3);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default ProRevealScreen;
