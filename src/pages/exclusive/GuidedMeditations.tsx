import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Clock, Headphones, Moon, Sun, Brain, Heart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  script: string;
}

const meditations: Meditation[] = [
  {
    id: 'deep-sleep',
    title: 'Deep Sleep Journey',
    description: 'Drift into peaceful slumber with calming visualizations and gentle guidance.',
    duration: '3 min',
    category: 'Sleep',
    icon: Moon,
    script: `Close your eyes and take a deep, slow breath. Feel your body sink into wherever you're resting. With each exhale, let go of the day's tensions.

Imagine a warm, gentle wave of relaxation starting at the top of your head. It slowly flows down through your face, releasing any tightness. Your jaw softens. Your shoulders drop.

This peaceful wave continues down your arms to your fingertips, through your chest and stomach, down your legs to your toes. You are completely relaxed.

Picture yourself in a safe, peaceful place. Perhaps a quiet meadow under stars, or a cozy room with soft blankets. You are completely at peace. Let sleep gently embrace you now.`,
  },
  {
    id: 'morning-energy',
    title: 'Morning Energy Boost',
    description: 'Start your day with intention and vibrant energy to fuel your goals.',
    duration: '2 min',
    category: 'Morning',
    icon: Sun,
    script: `Good morning. Take a deep breath and welcome this new day full of possibilities.

As you inhale, imagine golden sunlight filling your body with warmth and energy. Feel it awakening every cell, bringing clarity to your mind.

Today is a gift. Set your intention now. What quality do you want to embody today? Perhaps it's patience, courage, or joy. Hold that intention in your heart.

You have everything you need within you. Take one more deep breath, smile gently, and step into this day with confidence and purpose. You are ready.`,
  },
  {
    id: 'stress-relief',
    title: 'Stress Release',
    description: 'Release tension and find your center with this calming session.',
    duration: '3 min',
    category: 'Stress Relief',
    icon: Heart,
    script: `Pause wherever you are. Take a deep breath in through your nose, and let it out slowly through your mouth.

Notice where you're holding tension. Perhaps your shoulders, your jaw, or your stomach. Breathe into those areas now.

With each exhale, imagine stress leaving your body like dark smoke dissolving into light. You are safe. You are capable. This moment of difficulty will pass.

Place one hand on your heart. Feel its steady rhythm. You have weathered storms before. You will weather this one too.

Take three more slow breaths. With each one, feel yourself becoming lighter, calmer, more centered. You are at peace.`,
  },
  {
    id: 'focus-clarity',
    title: 'Focus & Clarity',
    description: 'Sharpen your mind and enhance concentration for peak performance.',
    duration: '2 min',
    category: 'Focus',
    icon: Brain,
    script: `Sit comfortably and close your eyes. Take a deep breath to center yourself.

Imagine your mind as a clear, still lake. Any distracting thoughts are just leaves floating on the surface. Acknowledge them, then let them drift away.

Now, bring your attention to a single point of focus. Perhaps your breath, or the task ahead of you. Hold your attention there gently but firmly.

Your mind is sharp. Your thoughts are clear. You have the ability to concentrate deeply on what matters most.

Take one final breath. Open your eyes with renewed focus and clarity. You are ready to accomplish great things.`,
  },
];

const GuidedMeditations = () => {
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!isPremium) {
    navigate('/pro');
    return null;
  }

  const handlePlay = async (meditation: Meditation) => {
    // If already playing this meditation, pause it
    if (playingId === meditation.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Check if we have cached audio
    if (audioCache[meditation.id]) {
      playAudio(audioCache[meditation.id], meditation.id);
      return;
    }

    // Generate audio using ElevenLabs TTS
    setLoadingId(meditation.id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: meditation.script,
            voiceId: 'pFZP5JQG7iQjIQuC4Bku', // Lily - calm, soothing voice
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Cache the audio
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      setAudioCache(prev => ({ ...prev, [meditation.id]: audioUrl }));
      
      playAudio(audioUrl, meditation.id);
    } catch (error) {
      console.error('Error generating meditation audio:', error);
      toast.error('Failed to generate meditation audio. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const playAudio = (audioUrl: string, meditationId: string) => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    });

    audio.addEventListener('ended', () => {
      setPlayingId(null);
      setProgress(0);
    });

    audio.addEventListener('error', () => {
      toast.error('Error playing audio');
      setPlayingId(null);
      setProgress(0);
    });

    audio.play();
    setPlayingId(meditationId);
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
          const isLoading = loadingId === meditation.id;
          
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
                      onClick={() => handlePlay(meditation)}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : isPlaying ? (
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
              
              {/* Progress bar when playing or loading */}
              {(isPlaying || isLoading) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <Headphones className={`w-4 h-4 text-accent ${isLoading ? 'animate-pulse' : ''}`} />
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full transition-all duration-300" 
                        style={{ width: isLoading ? '0%' : `${progress}%` }} 
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {isLoading ? 'Generating...' : 'Playing...'}
                    </span>
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
