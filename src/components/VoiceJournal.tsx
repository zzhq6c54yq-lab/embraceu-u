import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoiceJournalProps {
  onTranscriptionComplete?: (text: string) => void;
  placeholder?: string;
  title?: string;
}

export default function VoiceJournal({ 
  onTranscriptionComplete, 
  placeholder = "Tap the microphone to start speaking, or type your thoughts here...",
  title = "Voice Journal"
}: VoiceJournalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording started... Speak now");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-transcribe`,
        {
          method: "POST",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      
      if (data.text) {
        const newText = transcript ? `${transcript} ${data.text}` : data.text;
        setTranscript(newText);
        onTranscriptionComplete?.(newText);
        toast.success("Transcription complete!");
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error("Failed to transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
    onTranscriptionComplete?.(e.target.value);
  };

  return (
    <Card className="card-embrace">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-serif italic">
          <Sparkles className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            value={transcript}
            onChange={handleTextChange}
            placeholder={placeholder}
            className="min-h-[120px] resize-none pr-12"
            disabled={isRecording || isTranscribing}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={cn(
              "absolute bottom-2 right-2 rounded-full transition-all duration-300",
              isRecording && "bg-destructive text-destructive-foreground hover:bg-destructive/90 animate-pulse"
            )}
          >
            {isTranscribing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          {isRecording 
            ? "Recording... Tap again to stop" 
            : isTranscribing 
              ? "Transcribing your voice..." 
              : "Tap the mic to speak or type your thoughts"}
        </p>
      </CardContent>
    </Card>
  );
}
