import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AvatarBuilder, parseAvatarConfig, serializeAvatarConfig, AvatarConfig } from "./avatar";

interface AvatarSelectorProps {
  currentAvatar?: string | null;
  onAvatarChange?: (avatarConfig: string) => void;
}

const AvatarSelector = ({ currentAvatar, onAvatarChange }: AvatarSelectorProps) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const initialConfig = parseAvatarConfig(currentAvatar || null);

  const handleSave = async (config: AvatarConfig) => {
    if (!user) return;
    
    setIsSaving(true);
    const serialized = serializeAvatarConfig(config);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: serialized })
        .eq("user_id", user.id);

      if (error) throw error;

      onAvatarChange?.(serialized);
      toast.success("Avatar saved!");
    } catch (error) {
      console.error("Error saving avatar:", error);
      toast.error("Failed to save avatar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AvatarBuilder 
      initialConfig={initialConfig} 
      onSave={handleSave} 
      isSaving={isSaving} 
    />
  );
};

export default AvatarSelector;
