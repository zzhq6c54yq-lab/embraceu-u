import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import OnboardingTour from "@/components/OnboardingTour";

const breathTourSteps = [
  {
    target: "[data-tour='breath-header']",
    title: "Welcome to Breathwork",
    description: "Conscious breathing exercises to calm your mind, reduce stress, and find inner peace.",
    position: "bottom" as const,
  },
  {
    target: "[data-tour='breath-patterns']",
    title: "Choose Your Pattern",
    description: "Select from scientifically-backed breathing techniques. Each one serves a different purpose.",
    position: "bottom" as const,
  },
  {
    target: "[data-tour='breath-circle']",
    title: "Breathing Guide",
    description: "Follow the expanding and contracting circle. The countdown shows you when to breathe in, hold, and release.",
    position: "bottom" as const,
  },
  {
    target: "[data-tour='breath-controls']",
    title: "Control Your Session",
    description: "Press play to start, pause anytime, or reset to begin again. Your sessions are tracked automatically.",
    position: "top" as const,
  },
];

type BreathPhase = "inhale" | "hold" | "exhale" | "rest";

interface BreathPattern {
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  rest: number;
  cycles: number;
}

const breathPatterns: BreathPattern[] = [
  {
    name: "Box Breathing",
    description: "Equal parts inhale, hold, exhale, hold. Used by Navy SEALs for calm focus.",
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 4,
    cycles: 4,
  },
  {
    name: "4-7-8 Relaxation",
    description: "Dr. Andrew Weil's technique for deep relaxation and sleep.",
    inhale: 4,
    hold: 7,
    exhale: 8,
    rest: 0,
    cycles: 4,
  },
  {
    name: "Energizing Breath",
    description: "Quick inhales with longer exhales to increase alertness.",
    inhale: 2,
    hold: 0,
    exhale: 4,
    rest: 1,
    cycles: 6,
  },
  {
    name: "Calm Breath",
    description: "Extended exhale activates parasympathetic nervous system.",
    inhale: 4,
    hold: 2,
    exhale: 6,
    rest: 2,
    cycles: 5,
  },
  {
    name: "Morning Awakening",
    description: "Balanced breathing to gently energize for the day ahead.",
    inhale: 3,
    hold: 3,
    exhale: 3,
    rest: 1,
    cycles: 8,
  },
  {
    name: "Deep Relaxation",
    description: "Extended exhale for stress relief and deep calm.",
    inhale: 5,
    hold: 5,
    exhale: 8,
    rest: 2,
    cycles: 4,
  },
  {
    name: "Focus Boost",
    description: "Short, powerful breathing to sharpen concentration.",
    inhale: 3,
    hold: 6,
    exhale: 3,
    rest: 0,
    cycles: 6,
  },
  {
    name: "Sleep Prep",
    description: "Ultra-slow breathing to prepare your body for rest.",
    inhale: 6,
    hold: 6,
    exhale: 10,
    rest: 4,
    cycles: 3,
  },
  {
    name: "Anxiety Relief",
    description: "Long exhales to quickly reduce stress hormones.",
    inhale: 3,
    hold: 0,
    exhale: 9,
    rest: 2,
    cycles: 5,
  },
  {
    name: "Power Breath",
    description: "Short bursts to boost energy and alertness.",
    inhale: 2,
    hold: 2,
    exhale: 2,
    rest: 0,
    cycles: 10,
  },
  {
    name: "Mindful Breath",
    description: "Natural rhythm with gentle awareness.",
    inhale: 4,
    hold: 0,
    exhale: 4,
    rest: 0,
    cycles: 8,
  },
  {
    name: "Heart Coherence",
    description: "5-second rhythm to sync heart and brain.",
    inhale: 5,
    hold: 0,
    exhale: 5,
    rest: 0,
    cycles: 6,
  },
];

const phaseLabels: Record<BreathPhase, string> = {
  inhale: "Breathe In",
  hold: "Hold",
  exhale: "Release",
  rest: "Rest",
};

const allPhases: BreathPhase[] = ["inhale", "hold", "exhale", "rest"];

const Breath = () => {
  const { user } = useAuth();
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>(breathPatterns[0]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [countdown, setCountdown] = useState(selectedPattern.inhale);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getNextPhase = (current: BreathPhase): BreathPhase => {
    const currentIndex = allPhases.indexOf(current);
    let nextIndex = (currentIndex + 1) % 4;
    let nextPhase = allPhases[nextIndex];
    
    // Skip phases with 0 duration
    while (selectedPattern[nextPhase] === 0) {
      nextIndex = (nextIndex + 1) % 4;
      nextPhase = allPhases[nextIndex];
    }
    
    return nextPhase;
  };

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setTotalSeconds((s) => s + 1);
      
      setCountdown((prev) => {
        if (prev <= 1) {
          const currentIndex = allPhases.indexOf(phase);
          const nextPhase = getNextPhase(phase);
          const nextIndex = allPhases.indexOf(nextPhase);

          // Check if we completed a full cycle (back to inhale)
          if (nextPhase === "inhale" || nextIndex <= currentIndex) {
            if (currentCycle >= selectedPattern.cycles) {
              handleComplete();
              return 0;
            }
            setCurrentCycle((c) => c + 1);
          }

          setPhase(nextPhase);
          return selectedPattern[nextPhase];
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, phase, currentCycle, selectedPattern]);

  const handleStart = () => {
    setIsActive(true);
    setIsComplete(false);
  };

  const handlePause = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase("inhale");
    setCountdown(selectedPattern.inhale);
    setCurrentCycle(1);
    setTotalSeconds(0);
    setIsComplete(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleComplete = async () => {
    setIsActive(false);
    setIsComplete(true);
    if (intervalRef.current) clearInterval(intervalRef.current);

    toast.success("Breathwork complete", {
      description: `${selectedPattern.cycles} cycles of ${selectedPattern.name}`,
    });

    if (user) {
      await supabase.from("rituals_completed").insert({
        user_id: user.id,
        ritual_type: selectedPattern.name,
        duration_seconds: totalSeconds,
      });
    }
  };

  const handlePatternSelect = (pattern: BreathPattern) => {
    if (isActive) {
      handleReset();
    }
    setSelectedPattern(pattern);
    setCountdown(pattern.inhale);
    setPhase("inhale");
  };

  const progress = currentCycle / selectedPattern.cycles;
  const circleScale = phase === "inhale" ? 1.2 : phase === "exhale" ? 0.85 : 1;

  return (
    <AppLayout>
      <OnboardingTour
        steps={breathTourSteps}
        storageKey="embraceu-breath-tour-completed"
      />
      {/* Header */}
      <div className="text-center mt-4 mb-8" data-tour="breath-header">
        <h1 className="font-serif italic text-3xl md:text-4xl text-foreground mb-2">
          Breathwork
        </h1>
        <p className="text-label">CONSCIOUS BREATHING FOR INNER CALM</p>
      </div>

      {/* Pattern selector - 2 row grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6" data-tour="breath-patterns">
        {breathPatterns.map((pattern) => (
          <button
            key={pattern.name}
            onClick={() => handlePatternSelect(pattern)}
            className={cn(
              "p-4 rounded-xl text-left transition-all border",
              selectedPattern.name === pattern.name
                ? "bg-primary/10 border-primary text-foreground ring-2 ring-primary/30"
                : "bg-card border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            <span className={cn(
              "text-sm font-semibold block mb-1",
              selectedPattern.name === pattern.name ? "text-foreground" : "text-foreground"
            )}>
              {pattern.name}
            </span>
            <span className="text-xs text-muted-foreground block">
              {pattern.inhale}-{pattern.hold > 0 ? pattern.hold : '0'}-{pattern.exhale}
              {pattern.rest > 0 ? `-${pattern.rest}` : ''} · {pattern.cycles} cycles
            </span>
          </button>
        ))}
      </div>

      {/* Pattern description */}
      <div className="text-center mb-8">
        <p className="text-muted-foreground font-serif italic text-sm">
          {selectedPattern.description}
        </p>
        <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>In: {selectedPattern.inhale}s</span>
          {selectedPattern.hold > 0 && <span>Hold: {selectedPattern.hold}s</span>}
          <span>Out: {selectedPattern.exhale}s</span>
          {selectedPattern.rest > 0 && <span>Rest: {selectedPattern.rest}s</span>}
        </div>
      </div>

      {/* Breathing circle */}
      <div className="flex flex-col items-center justify-center mb-8" data-tour="breath-circle">
        <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center">
          {/* Outer ring progress */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
              strokeDashoffset={2 * Math.PI * 45 * (1 - progress)}
              className="text-primary transition-all duration-500"
              strokeLinecap="round"
            />
          </svg>

          {/* Breathing circle */}
          <div
            className={cn(
              "w-40 h-40 md:w-48 md:h-48 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ease-in-out",
              phase === "inhale" && "bg-primary/20",
              phase === "hold" && "bg-primary/30",
              phase === "exhale" && "bg-secondary",
              phase === "rest" && "bg-muted",
              isComplete && "bg-success/30"
            )}
            style={{ transform: isActive ? `scale(${circleScale})` : "scale(1)" }}
          >
            {isComplete ? (
              <>
                <Check className="w-10 h-10 text-success-foreground mb-2" />
                <span className="text-label">COMPLETE</span>
              </>
            ) : (
              <>
                <span className="text-4xl font-light text-foreground mb-2">
                  {countdown}
                </span>
                <span className="text-label">{phaseLabels[phase].toUpperCase()}</span>
              </>
            )}
          </div>
        </div>

        {/* Cycle indicator */}
        <div className="mt-6 flex gap-2">
          {Array.from({ length: selectedPattern.cycles }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i < currentCycle ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-8" data-tour="breath-controls">
        {!isActive ? (
          <button
            onClick={handleStart}
            disabled={isComplete}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-elevated hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Play className="w-6 h-6 text-primary-foreground ml-1" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center shadow-elevated hover:scale-105 transition-transform"
          >
            <Pause className="w-6 h-6 text-foreground" />
          </button>
        )}
        <button
          onClick={handleReset}
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Session stats */}
      {totalSeconds > 0 && (
        <div className="card-embrace text-center animate-fade-in">
          <p className="text-label mb-2">SESSION TIME</p>
          <p className="font-serif italic text-2xl text-foreground">
            {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, "0")}
          </p>
        </div>
      )}
    </AppLayout>
  );
};

export default Breath;
