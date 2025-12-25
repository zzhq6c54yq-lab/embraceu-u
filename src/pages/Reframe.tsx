import { useState } from "react";
import { Shuffle, Save, History } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const reframes: Record<string, string[]> = {
  failure: [
    "Learning opportunity",
    "Growth catalyst",
    "Stepping stone to mastery",
    "Feedback, not finality",
    "A lesson wrapped in disguise",
  ],
  stuck: [
    "Preparing for breakthrough",
    "Gathering momentum",
    "In a cocoon of transformation",
    "Pausing for clarity",
    "Building inner strength",
  ],
  "not enough": [
    "More than sufficient",
    "Complete as I am",
    "Abundantly capable",
    "Perfectly in progress",
    "Worthy without condition",
  ],
  anxious: [
    "Excited about possibilities",
    "Deeply caring",
    "Ready for growth",
    "Fully present",
    "Attuned to what matters",
  ],
  overwhelmed: [
    "Rich with opportunities",
    "Learning to prioritize",
    "Building capacity",
    "Practicing boundaries",
    "Growing through challenge",
  ],
  afraid: [
    "Courageous despite fear",
    "On the edge of growth",
    "Protecting something valuable",
    "Ready to expand comfort zone",
    "Brave in the face of uncertainty",
  ],
  lonely: [
    "Enjoying solitude",
    "Deepening self-connection",
    "Creating space for reflection",
    "Open to new connections",
    "Building inner companionship",
  ],
  angry: [
    "Passionate about boundaries",
    "Honoring my needs",
    "Clear about my values",
    "Motivated for change",
    "Speaking my truth",
  ],
  sad: [
    "Deeply feeling",
    "Processing important emotions",
    "Creating space for healing",
    "Honoring what matters",
    "Open to compassion",
  ],
  lost: [
    "On an adventure",
    "Discovering new paths",
    "Free from rigid plans",
    "Open to guidance",
    "Trusting the journey",
  ],
  weak: [
    "Conserving energy wisely",
    "Humble and teachable",
    "Ready to receive help",
    "Building strength quietly",
    "Gentle with myself",
  ],
  rejected: [
    "Redirected to better alignment",
    "Free to find my people",
    "Learning about my worth",
    "Making space for the right fit",
    "Brave for showing up authentically",
  ],
};

const triggerWords = [
  "Failure",
  "Stuck",
  "Anxious",
  "Overwhelmed",
  "Not enough",
  "Afraid",
  "Lonely",
  "Angry",
  "Sad",
  "Lost",
  "Weak",
  "Rejected",
];

const Reframe = () => {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [reframedWord, setReframedWord] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [recentReframes, setRecentReframes] = useState<Array<{ original: string; reframed: string }>>([]);

  const handleReframe = () => {
    const word = input.toLowerCase().trim();

    if (!word) {
      toast.error("Enter a limiting thought to reframe");
      return;
    }

    setIsAnimating(true);

    // Find matching reframes
    const matches = Object.entries(reframes).find(
      ([key]) => word.includes(key) || key.includes(word)
    );

    setTimeout(() => {
      let newReframe: string;
      if (matches) {
        const options = matches[1];
        newReframe = options[Math.floor(Math.random() * options.length)];
      } else {
        // Generic positive reframes for unmatched words
        const generic = [
          "An invitation to grow",
          "A teacher in disguise",
          "Temporary, not permanent",
          "Part of my journey",
          "A doorway to wisdom",
          "Strength being forged",
          "Space for transformation",
          "A chapter, not the story",
        ];
        newReframe = generic[Math.floor(Math.random() * generic.length)];
      }

      setReframedWord(newReframe);
      setRecentReframes((prev) => [{ original: input, reframed: newReframe }, ...prev.slice(0, 4)]);
      setIsAnimating(false);
    }, 600);
  };

  const handleSaveReframe = async () => {
    if (!user) {
      toast.error("Sign in to save reframes");
      return;
    }

    if (!reframedWord || !input) return;

    const { error } = await supabase.from("saved_insights").insert({
      user_id: user.id,
      insight_text: `"${input}" → "${reframedWord}"`,
      insight_type: "reframe",
      category: "REFRAME",
    });

    if (error) {
      toast.error("Could not save reframe");
      return;
    }

    toast.success("Reframe saved to library");
  };

  const handleTryAnother = () => {
    if (!input.trim()) return;
    handleReframe();
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="text-center mt-4 mb-10">
        <h1 className="font-serif italic text-3xl md:text-4xl text-foreground mb-2">
          Word Reframing
        </h1>
        <p className="text-label">LANGUAGE IS A TOOL FOR CHANGE</p>
      </div>

      {/* Input section */}
      <div className="card-embrace">
        <label className="text-label block mb-4">LIMITING THOUGHT</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Failure, Stuck, Not enough, Anxious..."
          className="input-embrace min-h-[100px] resize-none"
        />
      </div>

      {/* Shuffle button */}
      <div className="flex justify-center my-10">
        <button
          onClick={handleReframe}
          disabled={isAnimating}
          className={cn(
            "w-20 h-20 rounded-full bg-primary flex items-center justify-center",
            "transition-all duration-300 hover:scale-105 active:scale-95",
            "shadow-elevated disabled:opacity-50",
            isAnimating && "animate-spin"
          )}
        >
          <Shuffle className="w-8 h-8 text-primary-foreground" />
        </button>
      </div>

      {/* Reframed result */}
      {reframedWord && !isAnimating && (
        <div className="insight-card-accent text-center animate-scale-in">
          <p className="text-label text-success-foreground mb-4">REFRAMED AS</p>
          <p className="font-serif italic text-2xl text-success-foreground mb-6">
            "{reframedWord}"
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleTryAnother}
              className="btn-embrace-outline text-xs flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              TRY ANOTHER
            </button>
            <button
              onClick={handleSaveReframe}
              className="btn-embrace bg-success-foreground text-background text-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              SAVE
            </button>
          </div>
        </div>
      )}

      {/* Quick suggestions */}
      <section className="mt-10">
        <h2 className="text-label mb-4">TRY THESE WORDS</h2>
        <div className="flex flex-wrap gap-2">
          {triggerWords.map((word) => (
            <button
              key={word}
              onClick={() => setInput(word)}
              className="btn-embrace-outline text-xs"
            >
              {word}
            </button>
          ))}
        </div>
      </section>

      {/* Recent reframes */}
      {recentReframes.length > 0 && (
        <section className="mt-10 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-label">RECENT REFRAMES</h2>
          </div>
          <div className="space-y-3">
            {recentReframes.map((item, i) => (
              <div key={i} className="card-embrace py-4">
                <p className="text-muted-foreground text-sm mb-1">
                  "{item.original}"
                </p>
                <p className="font-serif italic text-foreground">
                  → "{item.reframed}"
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppLayout>
  );
};

export default Reframe;
