import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface QuickGratitudeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickGratitudeModal = ({ isOpen, onClose }: QuickGratitudeModalProps) => {
  const { user } = useAuth();
  const [gratitude, setGratitude] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!gratitude.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("gratitude_entries").insert({
        user_id: user.id,
        gratitude_text: gratitude.trim(),
      });

      if (error) throw error;

      toast.success("Gratitude saved!");
      setGratitude("");
      onClose();
    } catch (error) {
      toast.error("Failed to save gratitude");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif italic text-xl">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Quick Gratitude
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            What's one thing you're grateful for right now?
          </p>
          
          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="I'm grateful for..."
            className="input-embrace min-h-[100px] resize-none"
            autoFocus
          />
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!gratitude.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickGratitudeModal;
