import { useState } from "react";
import { Shuffle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

const reframes: Record<string, string[]> = {
  failure: [
    "Learning opportunity",
    "Growth catalyst",
    "Stepping stone to mastery",
    "Feedback, not finality",
  ],
  stuck: [
    "Preparing for breakthrough",
    "Gathering momentum",
    "In a cocoon of transformation",
    "Pausing for clarity",
  ],
  "not enough": [
    "More than sufficient",
    "Complete as I am",
    "Abundantly capable",
    "Perfectly in progress",
  ],
  anxious: [
    "Excited about possibilities",
    "Deeply caring",
    "Ready for growth",
    "Fully present",
  ],
  overwhelmed: [
    "Rich with opportunities",
    "Learning to prioritize",
    "Building capacity",
    "Practicing boundaries",
  ],
};

const Reframe = () => {
  const [input, setInput] = useState("");
  const [reframedWord, setReframedWord] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleReframe = () => {
    const word = input.toLowerCase().trim();
    
    if (!word) {
      toast.error("Enter a limiting thought to reframe");
      return;
    }

    setIsAnimating(true);
    
    // Find matching reframes or use default
    const matches = Object.entries(reframes).find(([key]) => 
      word.includes(key) || key.includes(word)
    );

    setTimeout(() => {
      if (matches) {
        const options = matches[1];
        setReframedWord(options[Math.floor(Math.random() * options.length)]);
      } else {
        // Generic positive reframes
        const generic = [
          "An invitation to grow",
          "A teacher in disguise",
          "Temporary, not permanent",
          "Part of my journey",
        ];
        setReframedWord(generic[Math.floor(Math.random() * generic.length)]);
      }
      setIsAnimating(false);
    }, 600);
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
          placeholder="e.g. Failure, Stuck, Not enough"
          className="input-embrace min-h-[100px] resize-none"
        />
      </div>

      {/* Shuffle button */}
      <div className="flex justify-center my-10">
        <button
          onClick={handleReframe}
          disabled={isAnimating}
          className={`
            w-20 h-20 rounded-full bg-primary flex items-center justify-center
            transition-all duration-300 hover:scale-105 active:scale-95
            shadow-elevated disabled:opacity-50
            ${isAnimating ? "animate-spin" : ""}
          `}
        >
          <Shuffle className="w-8 h-8 text-primary-foreground" />
        </button>
      </div>

      {/* Reframed result */}
      {reframedWord && !isAnimating && (
        <div className="insight-card-accent text-center animate-scale-in">
          <p className="text-label text-success-foreground mb-4">REFRAMED AS</p>
          <p className="font-serif italic text-2xl text-success-foreground">
            "{reframedWord}"
          </p>
        </div>
      )}

      {/* Suggestions */}
      <section className="mt-10">
        <h2 className="text-label mb-4">TRY THESE WORDS</h2>
        <div className="flex flex-wrap gap-2">
          {["Failure", "Stuck", "Anxious", "Overwhelmed", "Not enough"].map((word) => (
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
    </AppLayout>
  );
};

export default Reframe;
