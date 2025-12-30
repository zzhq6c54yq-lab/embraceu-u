import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AVATAR_OPTIONS = [
  { id: "lotus", emoji: "🪷", label: "Lotus" },
  { id: "sun", emoji: "☀️", label: "Sun" },
  { id: "moon", emoji: "🌙", label: "Moon" },
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "heart", emoji: "💜", label: "Heart" },
  { id: "butterfly", emoji: "🦋", label: "Butterfly" },
  { id: "rainbow", emoji: "🌈", label: "Rainbow" },
  { id: "mountain", emoji: "🏔️", label: "Mountain" },
  { id: "wave", emoji: "🌊", label: "Wave" },
  { id: "leaf", emoji: "🍃", label: "Leaf" },
  { id: "flower", emoji: "🌸", label: "Flower" },
  { id: "sparkles", emoji: "✨", label: "Sparkles" },
];

interface AvatarSelectorProps {
  currentAvatar?: string | null;
  onAvatarChange?: (avatarId: string) => void;
}

const AvatarSelector = ({ currentAvatar, onAvatarChange }: AvatarSelectorProps) => {
  const { user } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectAvatar = async (avatarId: string) => {
    if (!user) return;
    
    setSelectedAvatar(avatarId);
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarId })
        .eq("user_id", user.id);

      if (error) throw error;

      onAvatarChange?.(avatarId);
      toast.success("Avatar updated!");
    } catch (error) {
      console.error("Error saving avatar:", error);
      toast.error("Failed to save avatar");
      setSelectedAvatar(currentAvatar || "");
    } finally {
      setIsSaving(false);
    }
  };

  const currentOption = AVATAR_OPTIONS.find(a => a.id === selectedAvatar);

  return (
    <div className="space-y-4">
      {/* Current Avatar Display */}
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl",
          "border-2 border-primary/30 shadow-lg"
        )}>
          {currentOption?.emoji || "👤"}
        </div>
        <div>
          <p className="font-medium text-foreground">Your Avatar</p>
          <p className="text-sm text-muted-foreground">
            {currentOption?.label || "Choose an avatar below"}
          </p>
        </div>
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-4 gap-3">
        {AVATAR_OPTIONS.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => handleSelectAvatar(avatar.id)}
            disabled={isSaving}
            className={cn(
              "aspect-square rounded-xl flex items-center justify-center text-2xl transition-all duration-200",
              "hover:scale-105 active:scale-95",
              selectedAvatar === avatar.id
                ? "bg-primary/20 border-2 border-primary shadow-md"
                : "bg-secondary/50 border border-border hover:bg-secondary"
            )}
            aria-label={avatar.label}
          >
            {avatar.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export { AVATAR_OPTIONS };
export default AvatarSelector;
