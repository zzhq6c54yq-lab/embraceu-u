import { useState } from "react";
import { Shuffle, Save, History } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const reframes: Record<string, string[]> = {
  // Core Emotions
  failure: [
    "Learning opportunity",
    "Growth catalyst",
    "Stepping stone to mastery",
    "Feedback, not finality",
    "A lesson wrapped in disguise",
    "Proof that I tried",
    "Data for my next attempt",
  ],
  stuck: [
    "Preparing for breakthrough",
    "Gathering momentum",
    "In a cocoon of transformation",
    "Pausing for clarity",
    "Building inner strength",
    "Resting before rising",
  ],
  "not enough": [
    "More than sufficient",
    "Complete as I am",
    "Abundantly capable",
    "Perfectly in progress",
    "Worthy without condition",
    "Exactly who I need to be",
  ],
  anxious: [
    "Excited about possibilities",
    "Deeply caring",
    "Ready for growth",
    "Fully present",
    "Attuned to what matters",
    "My body preparing me",
  ],
  overwhelmed: [
    "Rich with opportunities",
    "Learning to prioritize",
    "Building capacity",
    "Practicing boundaries",
    "Growing through challenge",
    "Capable of handling this",
  ],
  afraid: [
    "Courageous despite fear",
    "On the edge of growth",
    "Protecting something valuable",
    "Ready to expand comfort zone",
    "Brave in the face of uncertainty",
    "Fear means I care",
  ],
  lonely: [
    "Enjoying solitude",
    "Deepening self-connection",
    "Creating space for reflection",
    "Open to new connections",
    "Building inner companionship",
    "Reconnecting with myself",
  ],
  angry: [
    "Passionate about boundaries",
    "Honoring my needs",
    "Clear about my values",
    "Motivated for change",
    "Speaking my truth",
    "Protecting what matters",
  ],
  sad: [
    "Deeply feeling",
    "Processing important emotions",
    "Creating space for healing",
    "Honoring what matters",
    "Open to compassion",
    "Allowing myself to feel",
  ],
  lost: [
    "On an adventure",
    "Discovering new paths",
    "Free from rigid plans",
    "Open to guidance",
    "Trusting the journey",
    "Finding my own way",
  ],
  weak: [
    "Conserving energy wisely",
    "Humble and teachable",
    "Ready to receive help",
    "Building strength quietly",
    "Gentle with myself",
    "Resting to recover",
  ],
  rejected: [
    "Redirected to better alignment",
    "Free to find my people",
    "Learning about my worth",
    "Making space for the right fit",
    "Brave for showing up authentically",
    "Protected from wrong paths",
  ],
  
  // Self-Worth
  worthless: [
    "Inherently valuable",
    "Worthy of love and respect",
    "Precious beyond measure",
    "My worth is not negotiable",
    "Valuable just by existing",
  ],
  unlovable: [
    "Worthy of deep love",
    "Lovable as I am",
    "Deserving of affection",
    "Love starts with me",
    "Open to receiving love",
  ],
  broken: [
    "Beautifully imperfect",
    "Healing in progress",
    "Strong at the broken places",
    "Whole beneath the cracks",
    "Mending into something stronger",
  ],
  damaged: [
    "Resilient and recovering",
    "Scars tell my story",
    "Healing is happening",
    "Transformed by experience",
    "Growing through adversity",
  ],
  flawed: [
    "Perfectly imperfect",
    "Human and relatable",
    "Authentic and real",
    "Flaws make me unique",
    "Beautiful in my humanity",
  ],
  
  // Capability
  stupid: [
    "Learning at my own pace",
    "Wise in my own way",
    "Growing my understanding",
    "Smart in different ways",
    "Curious and open to learning",
  ],
  incompetent: [
    "Developing my skills",
    "Capable of improvement",
    "Learning through practice",
    "More capable than I realize",
    "Growing more competent daily",
  ],
  incapable: [
    "Capable in many ways",
    "Building new abilities",
    "Learning to do hard things",
    "More capable than I know",
    "Discovering hidden strengths",
  ],
  useless: [
    "Valuable and needed",
    "Contributing in unique ways",
    "My presence matters",
    "Useful in ways I don't see",
    "Purpose waiting to emerge",
  ],
  dumb: [
    "Intelligent in my own way",
    "Learning and growing",
    "Clever when it counts",
    "Smart in different areas",
    "Wise through experience",
  ],
  
  // Relationships
  abandoned: [
    "Free to find better connections",
    "Making space for right people",
    "Learning self-reliance",
    "Opening to new relationships",
    "Never truly alone",
  ],
  betrayed: [
    "Learning about trust",
    "Wiser about boundaries",
    "Protected by this lesson",
    "Stronger for surviving this",
    "Free from false connections",
  ],
  used: [
    "Learning my worth",
    "Setting better boundaries",
    "Recognizing my value",
    "Wiser about intentions",
    "Protecting my energy now",
  ],
  ignored: [
    "Visible to the right people",
    "Making myself heard",
    "Worthy of attention",
    "Finding my audience",
    "My voice matters",
  ],
  unwanted: [
    "Wanted by the right people",
    "Belonging is coming",
    "Valued for who I am",
    "Creating my own belonging",
    "Welcoming myself first",
  ],
  
  // Work & Career
  unemployable: [
    "Skills waiting to be discovered",
    "Creating my own opportunities",
    "Valuable in unique ways",
    "The right role is coming",
    "Building my own path",
  ],
  mediocre: [
    "Solid and consistent",
    "Excellence in progress",
    "Good enough is enough",
    "Improving steadily",
    "Mastery takes time",
  ],
  underqualified: [
    "Learning quickly",
    "Growing into the role",
    "Bringing fresh perspective",
    "Qualifications are developing",
    "Potential over credentials",
  ],
  impostor: [
    "Earning my place",
    "Qualified through effort",
    "Belonging here",
    "Growing into my role",
    "Proof of my capabilities",
  ],
  
  // Future
  hopeless: [
    "Hope is renewable",
    "Possibility exists",
    "Change is always possible",
    "Tomorrow brings new chances",
    "Seeds of hope are planted",
  ],
  doomed: [
    "Outcome is not fixed",
    "Future is unwritten",
    "I can change direction",
    "Plot twist incoming",
    "Destiny is in my hands",
  ],
  trapped: [
    "Options are emerging",
    "Freedom is possible",
    "Finding my way out",
    "Doors are opening",
    "Escape routes exist",
  ],
  pointless: [
    "Meaning is being created",
    "Purpose is unfolding",
    "Every moment matters",
    "Significance in small things",
    "Point is in the journey",
  ],
  
  // Physical
  ugly: [
    "Uniquely beautiful",
    "Attractive in my own way",
    "Beauty beyond appearance",
    "Seeing my true beauty",
    "Attractive from within",
  ],
  fat: [
    "My body is capable",
    "Health over appearance",
    "Body acceptance journey",
    "Worthy at any size",
    "My body serves me well",
  ],
  old: [
    "Rich with experience",
    "Wise and seasoned",
    "Age brings wisdom",
    "Still growing and evolving",
    "Every age has beauty",
  ],
  
  // Mental State
  crazy: [
    "Creatively wired",
    "Thinking differently",
    "Unique perspective",
    "Neurodiverse and valid",
    "Unconventionally brilliant",
  ],
  unstable: [
    "Finding my balance",
    "Navigating uncertainty",
    "Building stability",
    "Flexibility in motion",
    "Adapting and adjusting",
  ],
  numb: [
    "Protecting myself",
    "Feeling will return",
    "Healing in progress",
    "Emotions are resting",
    "Safety in stillness",
  ],
  empty: [
    "Space for something new",
    "Clearing for growth",
    "Room for fulfillment",
    "Quiet before creativity",
    "Openness to receive",
  ],
  
  // Common Sentences/Phrases
  "i can't": [
    "I'm learning how to",
    "I haven't yet, but I will",
    "Challenge accepted",
    "I'm figuring it out",
    "I'm finding my way",
  ],
  "i always": [
    "I sometimes",
    "I'm working on changing",
    "Patterns can shift",
    "Old habits are changing",
    "I'm creating new patterns",
  ],
  "i never": [
    "I haven't yet",
    "There's always a first time",
    "That's about to change",
    "New beginnings ahead",
    "Never say never",
  ],
  "i should": [
    "I choose to",
    "I want to",
    "I could",
    "It might be nice to",
    "I'm considering",
  ],
  "too late": [
    "Right on time",
    "Perfect timing for me",
    "Never too late to start",
    "The best time is now",
    "My timing is unique",
  ],
  "my fault": [
    "A learning experience",
    "Something I can grow from",
    "Responsibility, not blame",
    "An opportunity to improve",
    "Part of being human",
  ],
  "no one cares": [
    "The right people care",
    "I care about myself",
    "Care is coming my way",
    "Connection is possible",
    "Someone out there cares",
  ],
  "give up": [
    "Take a strategic pause",
    "Rest and reassess",
    "Try a different approach",
    "Pivot, don't quit",
    "Regroup and return",
  ],
  "hate myself": [
    "Learning to accept myself",
    "Growing in self-compassion",
    "Worthy of my own love",
    "Practicing self-kindness",
    "Deserving of gentleness",
  ],
  "mess up": [
    "Learn and adjust",
    "Grow from experience",
    "Human moment",
    "Opportunity to improve",
    "Course correction available",
  ],
  "not good enough": [
    "Good enough as I am",
    "Improving every day",
    "Exactly where I should be",
    "Progress over perfection",
    "My best is enough",
  ],
  "what's wrong with me": [
    "Nothing, I'm human",
    "I'm figuring things out",
    "Growth in progress",
    "Learning about myself",
    "Being wonderfully complex",
  ],
};

const triggerWords = [
  // Emotions
  "Failure", "Stuck", "Anxious", "Overwhelmed", "Afraid", "Lonely", "Angry", "Sad", "Lost", "Weak", "Rejected",
  // Self-Worth
  "Not enough", "Worthless", "Unlovable", "Broken", "Damaged", "Flawed",
  // Capability  
  "Stupid", "Incompetent", "Useless", "Impostor",
  // Relationships
  "Abandoned", "Betrayed", "Ignored", "Unwanted",
  // Future
  "Hopeless", "Trapped", "Pointless",
  // Mental State
  "Empty", "Numb", "Unstable",
  // Common Phrases
  "I can't", "Too late", "My fault", "Give up", "Not good enough",
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
