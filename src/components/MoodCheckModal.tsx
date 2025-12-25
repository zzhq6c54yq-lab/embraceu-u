import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MoodCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const moods = [
  { emoji: "😊", label: "Joyful", color: "bg-yellow-100 dark:bg-yellow-900/30" },
  { emoji: "😌", label: "Calm", color: "bg-blue-100 dark:bg-blue-900/30" },
  { emoji: "😐", label: "Neutral", color: "bg-gray-100 dark:bg-gray-800/30" },
  { emoji: "😔", label: "Sad", color: "bg-indigo-100 dark:bg-indigo-900/30" },
  { emoji: "😤", label: "Frustrated", color: "bg-red-100 dark:bg-red-900/30" },
  { emoji: "😰", label: "Anxious", color: "bg-purple-100 dark:bg-purple-900/30" },
  { emoji: "🥱", label: "Tired", color: "bg-slate-100 dark:bg-slate-800/30" },
  { emoji: "🤗", label: "Grateful", color: "bg-pink-100 dark:bg-pink-900/30" },
  { emoji: "💪", label: "Motivated", color: "bg-orange-100 dark:bg-orange-900/30" },
  { emoji: "🌟", label: "Inspired", color: "bg-amber-100 dark:bg-amber-900/30" },
  { emoji: "😢", label: "Overwhelmed", color: "bg-cyan-100 dark:bg-cyan-900/30" },
  { emoji: "🙏", label: "Hopeful", color: "bg-emerald-100 dark:bg-emerald-900/30" },
];

const MoodCheckModal = ({ isOpen, onClose }: MoodCheckModalProps) => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    if (!user) {
      toast.error("Sign in to track your mood");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.from("mood_entries").insert({
      user_id: user.id,
      mood: selectedMood,
      note: note.trim() || null,
    });

    setIsSaving(false);

    if (error) {
      toast.error("Could not save mood");
      return;
    }

    toast.success("Mood captured", {
      description: `Feeling ${selectedMood.toLowerCase()} today`,
    });

    setSelectedMood(null);
    setNote("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif italic text-2xl text-foreground">
            How are you feeling?
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Mood grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {moods.map((mood) => (
            <button
              key={mood.label}
              onClick={() => setSelectedMood(mood.label)}
              className={cn(
                "flex flex-col items-center p-3 rounded-xl transition-all",
                mood.color,
                selectedMood === mood.label
                  ? "ring-2 ring-primary scale-105"
                  : "hover:scale-105"
              )}
            >
              <span className="text-2xl mb-1">{mood.emoji}</span>
              <span className="text-xs text-foreground font-medium">
                {mood.label}
              </span>
            </button>
          ))}
        </div>

        {/* Optional note */}
        <div className="mb-6">
          <label className="text-label block mb-2">ADD A NOTE (OPTIONAL)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind?"
            className="input-embrace min-h-[80px] resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-embrace-outline flex-1"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedMood || isSaving}
            className="btn-embrace bg-primary text-primary-foreground flex-1 disabled:opacity-50"
          >
            {isSaving ? "SAVING..." : "SAVE MOOD"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodCheckModal;
