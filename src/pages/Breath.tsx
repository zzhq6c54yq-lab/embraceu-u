import { useState, useEffect } from "react";
import { Wind } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";

type BreathPhase = "ready" | "inhale" | "hold" | "exhale";

const Breath = () => {
  const [phase, setPhase] = useState<BreathPhase>("ready");
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const phaseLabels = {
    ready: "READY",
    inhale: "BREATHE IN",
    hold: "HOLD",
    exhale: "BREATHE OUT",
  };

  const phaseDurations = {
    inhale: 4,
    hold: 4,
    exhale: 6,
  };

  useEffect(() => {
    if (!isActive || phase === "ready") return;

    const interval = setInterval(() => {
      setSeconds((s) => {
        const duration = phaseDurations[phase as keyof typeof phaseDurations];
        
        if (s >= duration - 1) {
          // Move to next phase
          if (phase === "inhale") setPhase("hold");
          else if (phase === "hold") setPhase("exhale");
          else if (phase === "exhale") setPhase("inhale");
          return 0;
        }
        return s + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const startBreath = () => {
    setIsActive(true);
    setPhase("inhale");
    setSeconds(0);
  };

  const stopBreath = () => {
    setIsActive(false);
    setPhase("ready");
    setSeconds(0);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="text-center mt-4 mb-12">
        <h1 className="font-serif italic text-3xl md:text-4xl text-foreground mb-2">
          Breath Ritual
        </h1>
        <p className="text-label">SYNC WITH THE UNIVERSE</p>
      </div>

      {/* Breath circle */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Outer glow ring */}
          <div 
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-1000",
              isActive && "animate-pulse-soft",
              phase === "inhale" && "scale-110",
              phase === "exhale" && "scale-100"
            )}
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)",
              transform: `scale(${phase === "inhale" ? 1.3 : phase === "hold" ? 1.3 : 1})`,
              transition: "transform 4s ease-in-out",
            }}
          />
          
          {/* Main circle */}
          <div 
            className={cn(
              "relative w-64 h-64 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center",
              "border-4 border-border bg-card shadow-elevated",
              "transition-all duration-1000"
            )}
            style={{
              transform: isActive 
                ? `scale(${phase === "inhale" ? 1.15 : phase === "hold" ? 1.15 : 1})`
                : "scale(1)",
              transition: `transform ${phase === "inhale" ? 4 : phase === "exhale" ? 6 : 0}s ease-in-out`,
            }}
          >
            <span className="text-label mb-2">{phaseLabels[phase]}</span>
            <Wind className="w-10 h-10 text-muted-foreground/50 animate-pulse-soft" />
            
            {isActive && (
              <span className="text-2xl font-sans text-muted-foreground mt-4">
                {seconds + 1}
              </span>
            )}
          </div>
        </div>

        {/* Control button */}
        <button
          onClick={isActive ? stopBreath : startBreath}
          className="btn-embrace mt-12 min-w-[180px]"
        >
          {isActive ? "PAUSE BREATH" : "BEGIN BREATH"}
        </button>

        {/* Instructions */}
        {!isActive && (
          <div className="mt-12 text-center max-w-xs">
            <p className="text-muted-foreground text-sm">
              4 seconds inhale • 4 seconds hold • 6 seconds exhale
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Breath;
