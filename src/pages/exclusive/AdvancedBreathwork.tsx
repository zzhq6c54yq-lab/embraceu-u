import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Wind, Zap, Snowflake, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';

interface BreathTechnique {
  id: string;
  title: string;
  description: string;
  pattern: string;
  icon: React.ComponentType<{ className?: string }>;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  rounds: number;
}

const techniques: BreathTechnique[] = [
  {
    id: '4-7-8',
    title: '4-7-8 Relaxation',
    description: 'The natural tranquilizer for the nervous system. Perfect for sleep and anxiety.',
    pattern: 'Inhale 4s → Hold 7s → Exhale 8s',
    icon: Wind,
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    rounds: 4,
  },
  {
    id: 'box-advanced',
    title: 'Advanced Box Breathing',
    description: 'Extended box breathing used by Navy SEALs for peak performance.',
    pattern: 'Inhale 6s → Hold 6s → Exhale 6s → Hold 6s',
    icon: Square,
    inhale: 6,
    hold1: 6,
    exhale: 6,
    hold2: 6,
    rounds: 6,
  },
  {
    id: 'wim-hof',
    title: 'Power Breathing',
    description: 'Inspired by Wim Hof. Energizing technique for focus and vitality.',
    pattern: 'Quick inhales → Long exhale → Hold',
    icon: Zap,
    inhale: 2,
    hold1: 0,
    exhale: 2,
    hold2: 15,
    rounds: 3,
  },
  {
    id: 'coherent',
    title: 'Coherent Breathing',
    description: 'Heart-brain coherence for emotional balance and stress relief.',
    pattern: 'Inhale 5s → Exhale 5s (no holds)',
    icon: Snowflake,
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
    rounds: 10,
  },
];

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'complete';

const AdvancedBreathwork = () => {
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  const [selectedTechnique, setSelectedTechnique] = useState<BreathTechnique | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [timer, setTimer] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  if (!isPremium) {
    navigate('/pro');
    return null;
  }

  const getPhaseLabel = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold Empty';
      case 'complete': return 'Complete!';
    }
  };

  const getCircleScale = () => {
    if (!selectedTechnique) return 1;
    switch (phase) {
      case 'inhale': return 1.3;
      case 'hold1': return 1.3;
      case 'exhale': return 0.8;
      case 'hold2': return 0.8;
      default: return 1;
    }
  };

  useEffect(() => {
    if (!isActive || !selectedTechnique) return;

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        const newTime = prev + 1;
        let phaseDuration = 0;
        
        switch (phase) {
          case 'inhale': phaseDuration = selectedTechnique.inhale; break;
          case 'hold1': phaseDuration = selectedTechnique.hold1; break;
          case 'exhale': phaseDuration = selectedTechnique.exhale; break;
          case 'hold2': phaseDuration = selectedTechnique.hold2; break;
        }

        if (newTime >= phaseDuration) {
          // Move to next phase
          const nextPhase = (): Phase => {
            if (phase === 'inhale') return selectedTechnique.hold1 > 0 ? 'hold1' : 'exhale';
            if (phase === 'hold1') return 'exhale';
            if (phase === 'exhale') return selectedTechnique.hold2 > 0 ? 'hold2' : 'inhale';
            if (phase === 'hold2') {
              if (currentRound >= selectedTechnique.rounds) {
                setIsActive(false);
                return 'complete';
              }
              setCurrentRound((r) => r + 1);
              return 'inhale';
            }
            return 'inhale';
          };
          setPhase(nextPhase());
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, phase, selectedTechnique, currentRound]);

  const startSession = (technique: BreathTechnique) => {
    setSelectedTechnique(technique);
    setPhase('inhale');
    setTimer(0);
    setCurrentRound(1);
    setIsActive(true);
  };

  const resetSession = () => {
    setIsActive(false);
    setSelectedTechnique(null);
    setPhase('inhale');
    setTimer(0);
    setCurrentRound(1);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const togglePause = () => {
    setIsActive(!isActive);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => selectedTechnique ? resetSession() : navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-serif italic text-2xl text-foreground">Advanced Breathwork</h1>
          <p className="text-sm text-muted-foreground">Expert-level breathing techniques</p>
        </div>
      </div>

      {/* Active Session */}
      {selectedTechnique ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* Breathing Circle */}
          <div className="relative mb-8">
            <div 
              className="w-48 h-48 rounded-full border-4 border-accent/60 flex items-center justify-center transition-transform duration-1000 ease-in-out"
              style={{ transform: `scale(${getCircleScale()})` }}
            >
              <div className="text-center">
                <p className="text-2xl font-serif italic text-foreground">{getPhaseLabel()}</p>
                {phase !== 'complete' && (
                  <p className="text-4xl font-bold text-accent mt-2">{timer}</p>
                )}
              </div>
            </div>
            <div className="absolute inset-0 rounded-full bg-accent/20 blur-3xl -z-10 animate-pulse" />
          </div>

          {/* Round indicator */}
          {phase !== 'complete' && (
            <p className="text-muted-foreground mb-6">
              Round {currentRound} of {selectedTechnique.rounds}
            </p>
          )}

          {/* Controls */}
          <div className="flex gap-4">
            {phase !== 'complete' && (
              <Button onClick={togglePause} size="lg" className="gap-2">
                {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isActive ? 'Pause' : 'Resume'}
              </Button>
            )}
            <Button onClick={resetSession} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              {phase === 'complete' ? 'New Session' : 'Reset'}
            </Button>
          </div>
        </div>
      ) : (
        /* Technique Selection */
        <div className="space-y-4 pb-20">
          {techniques.map((technique) => {
            const Icon = technique.icon;
            return (
              <button
                key={technique.id}
                onClick={() => startSession(technique)}
                className="w-full card-embrace p-5 text-left transition-all duration-300 hover:border-accent/50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-serif italic text-lg text-foreground mb-1">{technique.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{technique.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent font-mono">
                        {technique.pattern}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {technique.rounds} rounds
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default AdvancedBreathwork;