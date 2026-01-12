import { useState } from "react";
import { Wind, Heart, Eye, Sparkles, Smile, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import MicroRitualCard from "@/components/MicroRitualCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ActiveRitual {
  id: string;
  name: string;
  steps: string[];
  currentStep: number;
}

const microRituals = [
  {
    id: "breath",
    name: "3-Breath Reset",
    description: "Quick calming breaths",
    duration: "30 sec",
    icon: <Wind className="w-6 h-6 text-blue-500" />,
    color: "bg-blue-500/20",
    steps: [
      "Breathe in slowly for 4 seconds...",
      "Hold gently for 2 seconds...",
      "Exhale completely for 6 seconds...",
      "Breath 1 complete. Repeat.",
      "Breath 2 complete. One more.",
      "Final breath. You're centered.",
    ],
  },
  {
    id: "gratitude",
    name: "One-Word Gratitude",
    description: "Express quick gratitude",
    duration: "15 sec",
    icon: <Heart className="w-6 h-6 text-pink-500" />,
    color: "bg-pink-500/20",
    steps: [
      "Close your eyes briefly...",
      "What's one word for something you're grateful for?",
      "Hold that feeling of gratitude...",
      "Carry this warmth with you.",
    ],
  },
  {
    id: "bodyscan",
    name: "Body Scan Flash",
    description: "Quick awareness check",
    duration: "45 sec",
    icon: <Eye className="w-6 h-6 text-purple-500" />,
    color: "bg-purple-500/20",
    steps: [
      "Notice your feet on the ground...",
      "Scan up to your legs and hips...",
      "Feel your chest and shoulders...",
      "Notice any tension in your neck...",
      "Soften your face and jaw...",
      "Full body awareness complete.",
    ],
  },
  {
    id: "affirmation",
    name: "Affirmation Boost",
    description: "Power statement",
    duration: "20 sec",
    icon: <Sparkles className="w-6 h-6 text-yellow-500" />,
    color: "bg-yellow-500/20",
    steps: [
      "Take a deep breath...",
      "Repeat: 'I am capable and strong.'",
      "Feel the truth of these words...",
      "Step forward with confidence.",
    ],
  },
  {
    id: "smile",
    name: "Smile Moment",
    description: "Instant mood lift",
    duration: "10 sec",
    icon: <Smile className="w-6 h-6 text-green-500" />,
    color: "bg-green-500/20",
    steps: [
      "Let a genuine smile form...",
      "Feel the warmth spread...",
      "Notice how your mood shifts.",
    ],
  },
  {
    id: "grounding",
    name: "5-4-3-2-1 Ground",
    description: "Sensory grounding",
    duration: "45 sec",
    icon: <Eye className="w-6 h-6 text-teal-500" />,
    color: "bg-teal-500/20",
    steps: [
      "Notice 5 things you can see...",
      "Touch 4 things around you...",
      "Listen for 3 sounds...",
      "Identify 2 things you can smell...",
      "Notice 1 thing you can taste...",
      "You are grounded and present.",
    ],
  },
  {
    id: "release",
    name: "Tension Release",
    description: "Let go of stress",
    duration: "30 sec",
    icon: <Wind className="w-6 h-6 text-indigo-500" />,
    color: "bg-indigo-500/20",
    steps: [
      "Squeeze your fists tightly...",
      "Hold the tension for 5 seconds...",
      "Release and feel the contrast...",
      "Repeat with your shoulders...",
      "Release completely. Feel lighter.",
    ],
  },
  {
    id: "intention",
    name: "Micro Intention",
    description: "Set a quick focus",
    duration: "20 sec",
    icon: <Sparkles className="w-6 h-6 text-orange-500" />,
    color: "bg-orange-500/20",
    steps: [
      "What matters most right now?",
      "Name one intention for this moment...",
      "Commit to it silently...",
      "Move forward with purpose.",
    ],
  },
  {
    id: "compassion",
    name: "Self-Compassion",
    description: "Kindness for yourself",
    duration: "25 sec",
    icon: <Heart className="w-6 h-6 text-rose-500" />,
    color: "bg-rose-500/20",
    steps: [
      "Place a hand on your heart...",
      "Say: 'I am doing my best.'",
      "Feel the warmth of self-kindness...",
      "You deserve compassion too.",
    ],
  },
  {
    id: "pause",
    name: "Mindful Pause",
    description: "Reset between tasks",
    duration: "15 sec",
    icon: <Eye className="w-6 h-6 text-cyan-500" />,
    color: "bg-cyan-500/20",
    steps: [
      "Stop what you're doing...",
      "Take one deep breath...",
      "Notice this present moment...",
      "Continue refreshed.",
    ],
  },
];

const QuickRituals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeRitual, setActiveRitual] = useState<ActiveRitual | null>(null);
  const [completedRituals, setCompletedRituals] = useState<string[]>([]);

  const handleStartRitual = (ritual: typeof microRituals[0]) => {
    setActiveRitual({
      id: ritual.id,
      name: ritual.name,
      steps: ritual.steps,
      currentStep: 0,
    });
  };

  const handleNextStep = async () => {
    if (!activeRitual) return;

    if (activeRitual.currentStep < activeRitual.steps.length - 1) {
      setActiveRitual({
        ...activeRitual,
        currentStep: activeRitual.currentStep + 1,
      });
    } else {
      // Complete ritual
      if (user) {
        await supabase.from("rituals_completed").insert({
          user_id: user.id,
          ritual_type: `micro_${activeRitual.id}`,
          duration_seconds: 30,
        });
      }
      
      setCompletedRituals([...completedRituals, activeRitual.id]);
      setActiveRitual(null);
      toast.success("Micro-ritual complete!");
    }
  };

  const handleCloseRitual = () => {
    setActiveRitual(null);
  };

  return (
    <>
      {/* Active Ritual Overlay */}
      {activeRitual && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
          <button
            onClick={handleCloseRitual}
            className="absolute top-4 right-4 p-2 rounded-full bg-secondary"
          >
            <X className="w-5 h-5" />
          </button>

          <p className="text-label mb-4">{activeRitual.name.toUpperCase()}</p>
          
          <div className="w-full max-w-sm text-center">
            <p className="font-serif italic text-2xl text-foreground mb-12 min-h-[80px]">
              {activeRitual.steps[activeRitual.currentStep]}
            </p>

            <div className="flex justify-center gap-2 mb-8">
              {activeRitual.steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i <= activeRitual.currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextStep}
              className="btn-embrace bg-primary text-primary-foreground w-full"
            >
              {activeRitual.currentStep < activeRitual.steps.length - 1
                ? "NEXT"
                : "COMPLETE"}
            </button>
          </div>
        </div>
      )}

      <AppLayout>
        <div className="mt-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <h1 className="font-serif italic text-3xl text-foreground mb-2">
            Quick Rituals
          </h1>
          <p className="text-muted-foreground">
            30-second wellness moments for busy days
          </p>
        </div>

        <div className="space-y-3 pb-8">
          {microRituals.map((ritual) => (
            <MicroRitualCard
              key={ritual.id}
              id={ritual.id}
              name={ritual.name}
              description={ritual.description}
              duration={ritual.duration}
              icon={ritual.icon}
              color={ritual.color}
              onStart={() => handleStartRitual(ritual)}
            />
          ))}
        </div>

        {completedRituals.length > 0 && (
          <div className="card-embrace text-center py-6 mb-8">
            <p className="text-label mb-2">TODAY'S PROGRESS</p>
            <p className="text-3xl font-semibold text-foreground mb-1">
              {completedRituals.length}
            </p>
            <p className="text-sm text-muted-foreground">
              micro-rituals completed
            </p>
          </div>
        )}
      </AppLayout>
    </>
  );
};

export default QuickRituals;
