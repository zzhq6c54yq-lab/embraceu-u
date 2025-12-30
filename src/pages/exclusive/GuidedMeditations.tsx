import { useState } from 'react';
import { ArrowLeft, Play, Pause, Clock, Headphones, Moon, Sun, Brain, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const meditations: Meditation[] = [
  {
    id: 'deep-sleep',
    title: 'Deep Sleep Journey',
    description: 'Drift into peaceful slumber with calming visualizations and gentle guidance.',
    duration: '20 min',
    category: 'Sleep',
    icon: Moon,
  },
  {
    id: 'morning-energy',
    title: 'Morning Energy Boost',
    description: 'Start your day with intention and vibrant energy to fuel your goals.',
    duration: '10 min',
    category: 'Morning',
    icon: Sun,
  },
  {
    id: 'stress-relief',
    title: 'Stress Release',
    description: 'Release tension and find your center with this calming session.',
    duration: '15 min',
    category: 'Stress Relief',
    icon: Heart,
  },
  {
    id: 'focus-clarity',
    title: 'Focus & Clarity',
    description: 'Sharpen your mind and enhance concentration for peak performance.',
    duration: '12 min',
    category: 'Focus',
    icon: Brain,
  },
];

const GuidedMeditations = () => {
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (!isPremium) {
    navigate('/pro');
    return null;
  }

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-serif italic text-2xl text-foreground">Guided Meditations</h1>
          <p className="text-sm text-muted-foreground">Premium sessions for deep relaxation</p>
        </div>
      </div>

      {/* Meditation List */}
      <div className="space-y-4 pb-20">
        {meditations.map((meditation) => {
          const Icon = meditation.icon;
          const isPlaying = playingId === meditation.id;
          
          return (
            <div
              key={meditation.id}
              className="card-embrace p-5 transition-all duration-300 hover:border-accent/50"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Icon className="w-7 h-7 text-accent" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif italic text-lg text-foreground">{meditation.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                      {meditation.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{meditation.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{meditation.duration}</span>
                    </div>
                    
                    <Button
                      size="sm"
                      variant={isPlaying ? "default" : "outline"}
                      onClick={() => togglePlay(meditation.id)}
                      className="gap-2"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Play
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Progress bar when playing */}
              {isPlaying && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <Headphones className="w-4 h-4 text-accent animate-pulse" />
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full animate-pulse" style={{ width: '30%' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">Playing...</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default GuidedMeditations;