import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Sparkles } from "lucide-react";

interface InsightPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  insightText: string;
  category: string;
  onComplete: (practiceNote: string) => void;
}

const InsightPracticeModal = ({
  isOpen,
  onClose,
  insightText,
  category,
  onComplete,
}: InsightPracticeModalProps) => {
  const [practiceNote, setPracticeNote] = useState("");

  const handleComplete = () => {
    onComplete(practiceNote);
    setPracticeNote("");
  };

  const handleClose = () => {
    setPracticeNote("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl text-foreground">
            Practice Complete
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Insight reminder */}
          <div className="p-4 bg-success/20 rounded-xl border border-success/30">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-success-foreground mb-2 block">
              {category}
            </span>
            <p className="font-serif italic text-foreground text-sm">
              "{insightText}"
            </p>
          </div>

          {/* Reflection prompt */}
          <div className="space-y-3">
            <p className="font-serif italic text-foreground">
              How did you integrate this insight today?
            </p>
            <Textarea
              value={practiceNote}
              onChange={(e) => setPracticeNote(e.target.value)}
              placeholder="Reflect on how you practiced this insight..."
              className="min-h-[100px] bg-background border-border focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onComplete("")}
              className="flex-1"
            >
              Skip Reflection
            </Button>
            <Button
              onClick={handleComplete}
              className="flex-1 bg-success text-success-foreground hover:bg-success/90"
            >
              <Check className="w-4 h-4 mr-2" />
              Complete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InsightPracticeModal;
