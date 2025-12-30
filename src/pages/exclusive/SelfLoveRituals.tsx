import { useState } from 'react';
import { ArrowLeft, Sun, Moon, Coffee, Sparkles, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';
import { useToast } from '@/hooks/use-toast';

interface RitualStep {
  title: string;
  description: string;
  duration: string;
}

interface Ritual {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  time: string;
  totalDuration: string;
  steps: RitualStep[];
}

const rituals: Ritual[] = [
  {
    id: 'morning-intention',
    title: 'Morning Intention Setting',
    description: 'Start your day with clarity and purpose',
    icon: Sun,
    time: 'Morning',
    totalDuration: '10 min',
    steps: [
      { title: 'Gentle Awakening', description: 'Take 3 deep breaths before opening your eyes. Feel gratitude for a new day.', duration: '1 min' },
      { title: 'Body Scan', description: 'Slowly scan from head to toe, noticing how your body feels without judgment.', duration: '2 min' },
      { title: 'Set Your Intention', description: 'Ask yourself: "How do I want to feel today?" Choose one word as your anchor.', duration: '2 min' },
      { title: 'Visualize Success', description: 'Imagine your day unfolding beautifully, aligned with your intention.', duration: '3 min' },
      { title: 'Affirmation Seal', description: 'Place your hand on your heart and say: "I am ready to receive all the good today brings."', duration: '2 min' },
    ],
  },
  {
    id: 'evening-gratitude',
    title: 'Evening Gratitude Ritual',
    description: 'Close your day with reflection and peace',
    icon: Moon,
    time: 'Evening',
    totalDuration: '8 min',
    steps: [
      { title: 'Release the Day', description: 'Take 5 slow breaths, letting go of any tension or stress from the day.', duration: '1 min' },
      { title: 'Three Gratitudes', description: 'Reflect on 3 things you\'re grateful for today, big or small.', duration: '2 min' },
      { title: 'Self-Appreciation', description: 'Acknowledge one thing you did well today. Give yourself credit.', duration: '2 min' },
      { title: 'Forgiveness Practice', description: 'Release any mistakes or regrets. Tomorrow is a fresh start.', duration: '2 min' },
      { title: 'Peaceful Closure', description: 'Place your hands on your heart and whisper: "I did my best today."', duration: '1 min' },
    ],
  },
  {
    id: 'self-care-sunday',
    title: 'Self-Care Sunday',
    description: 'Weekly reset for mind, body, and soul',
    icon: Coffee,
    time: 'Weekly',
    totalDuration: '30 min',
    steps: [
      { title: 'Digital Detox Start', description: 'Put your phone in another room. This time is for you alone.', duration: '1 min' },
      { title: 'Gentle Movement', description: 'Stretch, dance, or do gentle yoga. Move in ways that feel good.', duration: '10 min' },
      { title: 'Self-Care Activity', description: 'Choose something nourishing: a bath, skincare routine, or favorite tea.', duration: '10 min' },
      { title: 'Week Reflection', description: 'Journal about your wins, lessons, and what you\'re proud of.', duration: '5 min' },
      { title: 'Week Intention', description: 'Set 1-3 intentions for the coming week. Keep them gentle and achievable.', duration: '4 min' },
    ],
  },
  {
    id: 'instant-reset',
    title: 'Instant Self-Love Reset',
    description: 'Quick practice for overwhelming moments',
    icon: Sparkles,
    time: 'Anytime',
    totalDuration: '3 min',
    steps: [
      { title: 'Pause', description: 'Stop what you\'re doing. Place both feet firmly on the ground.', duration: '30 sec' },
      { title: 'Breathe', description: 'Take 4 deep breaths: inhale for 4, hold for 4, exhale for 4.', duration: '1 min' },
      { title: 'Hand on Heart', description: 'Place your hand on your chest. Feel your heartbeat.', duration: '30 sec' },
      { title: 'Kind Words', description: 'Say to yourself: "I am safe. I am loved. I am doing my best."', duration: '30 sec' },
      { title: 'Return', description: 'Open your eyes. You are grounded and ready to continue.', duration: '30 sec' },
    ],
  },
];

const SelfLoveRituals = () => {
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  const { toast } = useToast();
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  if (!isPremium) {
    navigate('/pro');
    return null;
  }

  const completeStep = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
      
      if (selectedRitual && stepIndex === selectedRitual.steps.length - 1) {
        toast({ title: 'Ritual Complete!', description: 'You\'ve completed this self-love practice. Well done!' });
      }
    }
    
    if (selectedRitual && stepIndex < selectedRitual.steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const resetRitual = () => {
    setSelectedRitual(null);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => selectedRitual ? resetRitual() : navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-serif italic text-2xl text-foreground">Self-Love Rituals</h1>
          <p className="text-sm text-muted-foreground">Daily rituals designed by experts</p>
        </div>
      </div>

      {/* Active Ritual */}
      {selectedRitual ? (
        <div className="space-y-6 pb-20">
          <div className="card-embrace-premium p-6 text-center">
            <h2 className="font-serif italic text-xl text-foreground mb-2">{selectedRitual.title}</h2>
            <p className="text-sm text-muted-foreground">{selectedRitual.totalDuration} • {selectedRitual.steps.length} steps</p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {selectedRitual.steps.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              const isCurrent = index === currentStep;
              
              return (
                <div
                  key={index}
                  className={`card-embrace p-5 transition-all duration-300 ${
                    isCurrent ? 'border-accent/50 bg-accent/5' : ''
                  } ${isCompleted ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium
                      ${isCompleted ? 'bg-green-500/20 text-green-500' : isCurrent ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}
                    `}>
                      {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-serif italic text-foreground">{step.title}</h3>
                        <span className="text-xs text-muted-foreground">{step.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      
                      {isCurrent && !isCompleted && (
                        <Button
                          onClick={() => completeStep(index)}
                          size="sm"
                          className="mt-3"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Complete Step
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion state */}
          {completedSteps.length === selectedRitual.steps.length && (
            <div className="text-center p-6">
              <Sparkles className="w-12 h-12 mx-auto text-accent mb-4" />
              <p className="font-serif italic text-xl text-foreground mb-4">Beautifully done!</p>
              <Button onClick={resetRitual}>Choose Another Ritual</Button>
            </div>
          )}
        </div>
      ) : (
        /* Ritual Selection */
        <div className="space-y-4 pb-20">
          {rituals.map((ritual) => {
            const Icon = ritual.icon;
            return (
              <button
                key={ritual.id}
                onClick={() => setSelectedRitual(ritual)}
                className="w-full card-embrace p-5 text-left transition-all duration-300 hover:border-accent/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif italic text-lg text-foreground">{ritual.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                        {ritual.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{ritual.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ritual.totalDuration} • {ritual.steps.length} steps</p>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default SelfLoveRituals;