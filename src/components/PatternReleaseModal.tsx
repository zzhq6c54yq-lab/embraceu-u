import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChevronRight, Check, Eye, Heart, Sparkles } from "lucide-react";

interface PatternReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  patternName: string;
  onComplete: (notes: {
    recognition: string;
    impact: string;
    intention: string;
  }) => void;
}

const steps = [
  {
    id: 1,
    title: "Recognition",
    icon: Eye,
    prompt: "When does this pattern show up in your life?",
    placeholder: "Describe the situations, triggers, or moments when you notice this pattern appearing...",
  },
  {
    id: 2,
    title: "Impact",
    icon: Heart,
    prompt: "How has this pattern affected you?",
    placeholder: "Reflect on how this pattern has impacted your life, relationships, or wellbeing...",
  },
  {
    id: 3,
    title: "Release Intention",
    icon: Sparkles,
    prompt: "What do you choose instead?",
    placeholder: "Describe what you're choosing to embrace as you release this pattern...",
  },
];

const PatternReleaseModal = ({
  isOpen,
  onClose,
  patternName,
  onComplete,
}: PatternReleaseModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [recognition, setRecognition] = useState("");
  const [impact, setImpact] = useState("");
  const [intention, setIntention] = useState("");

  const getCurrentValue = () => {
    switch (currentStep) {
      case 1:
        return recognition;
      case 2:
        return impact;
      case 3:
        return intention;
      default:
        return "";
    }
  };

  const setCurrentValue = (value: string) => {
    switch (currentStep) {
      case 1:
        setRecognition(value);
        break;
      case 2:
        setImpact(value);
        break;
      case 3:
        setIntention(value);
        break;
    }
  };

  const canProceed = getCurrentValue().trim().length > 0;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({
        recognition,
        impact,
        intention,
      });
      // Reset state
      setCurrentStep(1);
      setRecognition("");
      setImpact("");
      setIntention("");
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setRecognition("");
    setImpact("");
    setIntention("");
    onClose();
  };

  const currentStepData = steps[currentStep - 1];
  const StepIcon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl text-foreground">
            Releasing "{patternName}"
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-4">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                  currentStep > step.id
                    ? "bg-primary border-primary"
                    : currentStep === step.id
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <span className="text-xs font-semibold">{step.id}</span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 transition-all",
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <StepIcon className="w-5 h-5" />
            <span className="text-label">{currentStepData.title}</span>
          </div>

          <p className="font-serif italic text-lg text-foreground">
            {currentStepData.prompt}
          </p>

          <Textarea
            value={getCurrentValue()}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder={currentStepData.placeholder}
            className="min-h-[120px] bg-background border-border focus:ring-primary resize-none"
          />

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-muted-foreground">
              Step {currentStep} of 3
            </span>
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {currentStep === 3 ? (
                <>
                  Release Pattern
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatternReleaseModal;
