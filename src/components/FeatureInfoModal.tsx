import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lightbulb } from "lucide-react";

interface FeatureInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  howItWorks?: string[];
  examples?: string[];
}

const FeatureInfoModal = ({
  isOpen,
  onClose,
  title,
  description,
  howItWorks,
  examples,
}: FeatureInfoModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="font-serif italic text-xl">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-muted-foreground leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        {howItWorks && howItWorks.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-foreground mb-2">How it works:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              {howItWorks.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {examples && examples.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-foreground mb-2">Try it with:</h4>
            <ul className="space-y-1.5">
              {examples.map((example, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2 font-serif italic"
                >
                  "{example}"
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onClose}
          className="btn-embrace w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          GOT IT
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureInfoModal;
