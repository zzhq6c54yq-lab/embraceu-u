import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePremium } from "@/hooks/usePremium";

interface TextToSpeechProps {
  text: string;
  size?: "sm" | "default";
  className?: string;
  showLockForFree?: boolean;
  onUpgradeClick?: () => void;
}

export default function TextToSpeech({ 
  text, 
  size = "default",
  className,
  showLockForFree = true,
  onUpgradeClick
}: TextToSpeechProps) {
  const { isPremium } = usePremium();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    if (!isPremium) {
      if (onUpgradeClick) {
        onUpgradeClick();
      } else {
        toast.error("Upgrade to Pro to use Text-to-Speech");
      }
      return;
    }

    // If already playing, stop
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Use data URI for playback
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        toast.error("Failed to play audio");
      };

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("TTS error:", error);
      toast.error("Could not generate speech. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const buttonSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";

  // Show lock icon for non-premium if configured
  if (!isPremium && showLockForFree) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePlay}
        className={cn(buttonSize, "text-muted-foreground hover:text-primary", className)}
        title="Upgrade to Pro for Text-to-Speech"
      >
        <Lock className={iconSize} />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handlePlay}
      disabled={isLoading || !text}
      className={cn(
        buttonSize,
        isPlaying && "text-primary bg-primary/10",
        className
      )}
      title={isPlaying ? "Stop playback" : "Listen to this"}
    >
      {isLoading ? (
        <Loader2 className={cn(iconSize, "animate-spin")} />
      ) : isPlaying ? (
        <VolumeX className={iconSize} />
      ) : (
        <Volume2 className={iconSize} />
      )}
    </Button>
  );
}
