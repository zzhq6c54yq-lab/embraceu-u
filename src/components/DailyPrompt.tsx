import { useState, useEffect } from "react";
import { Shuffle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface DailyPromptProps {
  category?: "gratitude" | "reflection" | "growth";
  onUsePrompt: (prompt: string) => void;
}

interface Prompt {
  id: string;
  prompt_text: string;
  category: string;
}

export const DailyPrompt = ({ category, onUsePrompt }: DailyPromptProps) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [usedPromptIds, setUsedPromptIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchPrompts = async () => {
      let query = supabase
        .from("journal_prompts")
        .select("id, prompt_text, category");

      if (category) {
        query = query.eq("category", category);
      }

      const { data } = await query;
      if (data && data.length > 0) {
        setPrompts(data);
        // Get used prompts from localStorage
        const stored = localStorage.getItem("usedPromptIds");
        const used = stored ? JSON.parse(stored) : [];
        setUsedPromptIds(used);

        // Find an unused prompt
        const unused = data.filter((p) => !used.includes(p.id));
        if (unused.length > 0) {
          setCurrentPrompt(unused[Math.floor(Math.random() * unused.length)]);
        } else {
          // All prompts used, reset
          localStorage.removeItem("usedPromptIds");
          setUsedPromptIds([]);
          setCurrentPrompt(data[Math.floor(Math.random() * data.length)]);
        }
      }
    };

    fetchPrompts();
  }, [category]);

  const handleSkip = () => {
    if (!currentPrompt || prompts.length === 0) return;

    // Mark current as used
    const newUsed = [...usedPromptIds, currentPrompt.id];
    setUsedPromptIds(newUsed);
    localStorage.setItem("usedPromptIds", JSON.stringify(newUsed));

    // Find another unused prompt
    const unused = prompts.filter((p) => !newUsed.includes(p.id));
    if (unused.length > 0) {
      setCurrentPrompt(unused[Math.floor(Math.random() * unused.length)]);
    } else {
      // All used, reset and pick random
      localStorage.removeItem("usedPromptIds");
      setUsedPromptIds([]);
      setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    }
  };

  const handleUse = () => {
    if (currentPrompt) {
      onUsePrompt(currentPrompt.prompt_text);
      // Mark as used
      const newUsed = [...usedPromptIds, currentPrompt.id];
      localStorage.setItem("usedPromptIds", JSON.stringify(newUsed));
    }
  };

  if (!currentPrompt) return null;

  return (
    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Today's Prompt
      </p>
      <p className="text-foreground mb-4 leading-relaxed">
        {currentPrompt.prompt_text}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSkip}
          className="gap-1"
        >
          <Shuffle className="w-3 h-3" />
          Skip
        </Button>
        <Button size="sm" onClick={handleUse} className="gap-1">
          Use This
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
