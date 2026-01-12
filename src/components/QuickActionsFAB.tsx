import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Heart, Wind, Sparkles, Mic, Plus, X, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import MoodCheckModal from "./MoodCheckModal";
import QuickGratitudeModal from "./QuickGratitudeModal";
import VoiceJournal from "./VoiceJournal";
import HelpDrawer from "./HelpDrawer";
import { getHelpContentForRoute } from "@/lib/helpContent";

interface QuickActionsFABProps {
  onQuickBreath?: () => void;
}

const QuickActionsFAB = ({ onQuickBreath }: QuickActionsFABProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showGratitudeModal, setShowGratitudeModal] = useState(false);
  const [showVoiceJournal, setShowVoiceJournal] = useState(false);
  const [showQuickBreath, setShowQuickBreath] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [breathCount, setBreathCount] = useState(0);

  const helpContent = getHelpContentForRoute(location.pathname);

  const handleAction = (action: string) => {
    setIsOpen(false);
    
    if (action === "help") {
      setShowHelpDrawer(true);
      return;
    }

    if (!user) {
      toast.error("Sign in to use quick actions");
      return;
    }
    
    switch (action) {
      case "mood":
        setShowMoodModal(true);
        break;
      case "breath":
        setShowQuickBreath(true);
        setBreathCount(0);
        onQuickBreath?.();
        break;
      case "gratitude":
        setShowGratitudeModal(true);
        break;
      case "voice":
        setShowVoiceJournal(true);
        break;
    }
  };

  const handleBreathComplete = () => {
    if (breathCount < 2) {
      setBreathCount(breathCount + 1);
    } else {
      setShowQuickBreath(false);
      setBreathCount(0);
      toast.success("3-breath reset complete!");
    }
  };

  const actions = [
    { id: "mood", icon: Heart, label: "Mood", color: "text-pink-500" },
    { id: "breath", icon: Wind, label: "Breath", color: "text-blue-500" },
    { id: "gratitude", icon: Sparkles, label: "Gratitude", color: "text-yellow-500" },
    { id: "voice", icon: Mic, label: "Voice", color: "text-green-500" },
    ...(helpContent ? [{ id: "help", icon: HelpCircle, label: "Help", color: "text-cyan-500" }] : []),
  ];

  return (
    <>
      {/* Quick Breath Overlay */}
      {showQuickBreath && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <button
              onClick={() => setShowQuickBreath(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-secondary"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="text-label mb-4">3-BREATH RESET</p>
            <p className="text-muted-foreground mb-8">Breath {breathCount + 1} of 3</p>
            <button
              onClick={handleBreathComplete}
              className="w-32 h-32 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center animate-breathe"
            >
              <Wind className="w-12 h-12 text-primary" />
            </button>
            <p className="text-sm text-muted-foreground mt-8">
              Tap when exhale complete
            </p>
          </div>
        </div>
      )}

      {/* FAB Container */}
      <div className="fixed right-4 z-50" style={{ bottom: "160px" }}>
        {/* Action buttons - appear when open */}
        <div className={cn(
          "absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          {actions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-lg transition-all duration-200",
                "hover:scale-105 hover:shadow-xl"
              )}
              style={{ 
                transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                transform: isOpen ? "translateX(0)" : "translateX(20px)"
              }}
            >
              <action.icon className={cn("w-5 h-5", action.color)} />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Main FAB button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg",
            "flex items-center justify-center transition-all duration-300",
            "hover:scale-105 hover:shadow-xl",
            isOpen && "rotate-45 bg-secondary text-foreground"
          )}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Modals */}
      <MoodCheckModal isOpen={showMoodModal} onClose={() => setShowMoodModal(false)} />
      <QuickGratitudeModal isOpen={showGratitudeModal} onClose={() => setShowGratitudeModal(false)} />
      
      {showVoiceJournal && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <button
              onClick={() => setShowVoiceJournal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-secondary"
            >
              <X className="w-5 h-5" />
            </button>
            <VoiceJournal />
          </div>
        </div>
      )}

      {/* Help Drawer */}
      <HelpDrawer
        open={showHelpDrawer}
        onOpenChange={setShowHelpDrawer}
        onReplayTour={() => {}}
      />
    </>
  );
};

export default QuickActionsFAB;
