import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Heart } from "lucide-react";

interface QualityCultivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  qualityName: string;
  onComplete: (notes: { practice: string; gratitude: string }) => void;
}

const qualityPrompts: Record<string, string> = {
  Patience: "Describe a moment today where you chose patience over reaction.",
  Focus: "What distraction did you consciously set aside today to stay present?",
  Compassion: "How did you show compassion to yourself or others today?",
  Resilience: "What challenge did you face today, and how did you respond?",
  Authenticity: "In what way did you show up as your true self today?",
  Courage: "What small act of courage did you take today?",
  Presence: "Describe a moment when you were fully present today.",
  Kindness: "What act of kindness did you give or receive today?",
  Curiosity: "What did you wonder about or explore today?",
  Humility: "What did you learn from someone else today?",
  Empathy: "How did you connect with someone's experience today?",
  "Self-Discipline": "What commitment did you honor today?",
  Forgiveness: "What are you working on forgiving, in yourself or others?",
  Acceptance: "What did you accept without resistance today?",
  Optimism: "What positive possibility did you focus on today?",
  Generosity: "How were you generous with your time, energy, or resources?",
  Mindfulness: "When did you pause and notice your thoughts or feelings?",
  Integrity: "How did you align your actions with your values today?",
  Confidence: "What did you trust yourself to do today?",
  Flexibility: "How did you adapt to an unexpected change today?",
  Joy: "What brought you genuine joy today, even briefly?",
  Serenity: "What helped you find calm or peace today?",
  Wisdom: "What insight or understanding emerged for you today?",
  Trust: "In what way did you practice trust today?",
  Vulnerability: "How did you allow yourself to be seen today?",
  Playfulness: "What brought lightness or playfulness to your day?",
  Stillness: "When did you find moments of stillness today?",
  "Self-Love": "How did you care for yourself with love today?",
  "Inner Peace": "What practice brought you closer to inner peace?",
};

const getPromptForQuality = (quality: string): string => {
  return (
    qualityPrompts[quality] ||
    `How did you practice ${quality.toLowerCase()} today?`
  );
};

const QualityCultivateModal = ({
  isOpen,
  onClose,
  qualityName,
  onComplete,
}: QualityCultivateModalProps) => {
  const [practiceNote, setPracticeNote] = useState("");
  const [gratitudeNote, setGratitudeNote] = useState("");

  const canComplete = practiceNote.trim().length > 0;

  const handleComplete = () => {
    onComplete({
      practice: practiceNote,
      gratitude: gratitudeNote,
    });
    setPracticeNote("");
    setGratitudeNote("");
  };

  const handleClose = () => {
    setPracticeNote("");
    setGratitudeNote("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl text-foreground">
            Cultivating {qualityName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Practice reflection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-label">DAILY PRACTICE</span>
            </div>
            <p className="font-serif italic text-foreground">
              {getPromptForQuality(qualityName)}
            </p>
            <Textarea
              value={practiceNote}
              onChange={(e) => setPracticeNote(e.target.value)}
              placeholder="Reflect on your practice..."
              className="min-h-[100px] bg-background border-border focus:ring-primary resize-none"
            />
          </div>

          {/* Gratitude connection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-success-foreground">
              <Heart className="w-4 h-4" />
              <span className="text-label">GRATITUDE CONNECTION</span>
            </div>
            <p className="font-serif italic text-foreground text-sm">
              What are you grateful for about cultivating this quality?
            </p>
            <Textarea
              value={gratitudeNote}
              onChange={(e) => setGratitudeNote(e.target.value)}
              placeholder="Express your gratitude... (optional)"
              className="min-h-[80px] bg-background border-border focus:ring-primary resize-none"
            />
          </div>

          <Button
            onClick={handleComplete}
            disabled={!canComplete}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Complete Practice
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QualityCultivateModal;
