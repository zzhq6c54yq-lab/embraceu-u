import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, Bookmark } from "lucide-react";
import { format } from "date-fns";

interface InsightScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  insightText: string;
  category: string;
  onSave: (scheduledDate: Date | null) => void;
}

const InsightScheduleModal = ({
  isOpen,
  onClose,
  insightText,
  category,
  onSave,
}: InsightScheduleModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSaveNow = () => {
    onSave(null);
    onClose();
  };

  const handleSaveWithDate = () => {
    if (selectedDate) {
      onSave(selectedDate);
      setSelectedDate(undefined);
      setShowCalendar(false);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedDate(undefined);
    setShowCalendar(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl text-foreground">
            Save Insight
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview insight */}
          <div className="p-4 bg-secondary/50 rounded-xl">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-primary mb-2 block">
              {category}
            </span>
            <p className="font-serif italic text-foreground text-sm line-clamp-3">
              "{insightText}"
            </p>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>How to practice:</strong> Read this insight slowly. Let it
              settle. Choose a day to focus on integrating it.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarDays className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Schedule for a specific day</p>
                <p className="text-xs text-muted-foreground">
                  Set a date to practice this insight
                </p>
              </div>
            </Button>

            {showCalendar && (
              <div className="flex flex-col items-center gap-3 animate-fade-in">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border border-border"
                />
                {selectedDate && (
                  <Button
                    onClick={handleSaveWithDate}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    Save for {format(selectedDate, "MMM d, yyyy")}
                  </Button>
                )}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={handleSaveNow}
            >
              <Bookmark className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium">Save to library</p>
                <p className="text-xs text-muted-foreground">
                  Add to your collection without scheduling
                </p>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InsightScheduleModal;
