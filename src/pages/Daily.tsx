import { useState, useEffect } from "react";
import { Plus, X, Check, Sparkles, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import MoodCheckModal from "@/components/MoodCheckModal";
import PatternReleaseModal from "@/components/PatternReleaseModal";
import QualityCultivateModal from "@/components/QualityCultivateModal";

interface Pattern {
  id: string;
  pattern_name: string;
  is_released: boolean;
}

interface Quality {
  id: string;
  quality_name: string;
  progress: number;
}

const defaultPatterns = [
  "Procrastination",
  "Anxiety",
  "Self-Doubt",
  "Perfectionism",
  "People-Pleasing",
  "Overthinking",
  "Comparison",
  "Fear of Failure",
  "Impatience",
  "Negative Self-Talk",
  "Resentment",
  "Jealousy",
  "Fear of Rejection",
  "Control Issues",
  "Avoidance",
  "Scarcity Mindset",
  "Victim Mentality",
  "Imposter Syndrome",
  "Chronic Worry",
  "Need for Approval",
  "Defensiveness",
  "Judgment of Others",
  "Fear of Change",
  "Emotional Reactivity",
  "Holding Grudges",
  "Self-Sabotage",
  "Analysis Paralysis",
  "Fear of Success",
  "Codependency",
  "Catastrophizing",
];

// Removed "Gratitude" - now has dedicated journal page
const defaultQualities = [
  "Patience",
  "Focus",
  "Compassion",
  "Resilience",
  "Authenticity",
  "Courage",
  "Presence",
  "Kindness",
  "Curiosity",
  "Humility",
  "Empathy",
  "Self-Discipline",
  "Forgiveness",
  "Acceptance",
  "Optimism",
  "Generosity",
  "Mindfulness",
  "Integrity",
  "Confidence",
  "Flexibility",
  "Joy",
  "Serenity",
  "Wisdom",
  "Trust",
  "Vulnerability",
  "Playfulness",
  "Stillness",
  "Self-Love",
  "Inner Peace",
];

const Daily = () => {
  const { user } = useAuth();
  const [currentQuote, setCurrentQuote] = useState("");
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [visionInput, setVisionInput] = useState("");
  const [newPatternInput, setNewPatternInput] = useState("");
  const [newQualityInput, setNewQualityInput] = useState("");
  const [showAddPattern, setShowAddPattern] = useState(false);
  const [showAddQuality, setShowAddQuality] = useState(false);
  const [isDeconstructing, setIsDeconstructing] = useState(false);
  const [deconstructedSteps, setDeconstructedSteps] = useState<string[]>([]);
  const [showMoodModal, setShowMoodModal] = useState(false);

  // Pattern release modal state
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);

  // Quality cultivation modal state
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<Quality | null>(null);

  // Fetch daily quote
  useEffect(() => {
    const fetchQuote = async () => {
      const { data } = await supabase
        .from("daily_quotes")
        .select("quote_text")
        .limit(15);

      if (data && data.length > 0) {
        const randomQuote = data[Math.floor(Math.random() * data.length)];
        setCurrentQuote(randomQuote.quote_text);
      }
    };

    fetchQuote();
  }, []);

  // Fetch user patterns and qualities
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const [patternsRes, qualitiesRes] = await Promise.all([
        supabase.from("user_patterns").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
        supabase.from("user_qualities").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      ]);

      if (patternsRes.data) setPatterns(patternsRes.data);
      if (qualitiesRes.data) setQualities(qualitiesRes.data);
    };

    fetchUserData();
  }, [user]);

  const handleAddPattern = async (patternName: string) => {
    if (!user) {
      toast.error("Sign in to track patterns");
      return;
    }

    const { data, error } = await supabase
      .from("user_patterns")
      .insert({ user_id: user.id, pattern_name: patternName })
      .select()
      .single();

    if (error) {
      toast.error("Could not add pattern");
      return;
    }

    setPatterns([...patterns, data]);
    setNewPatternInput("");
    setShowAddPattern(false);
    toast.success("Pattern added for release");
  };

  const handleOpenPatternRelease = (pattern: Pattern) => {
    setSelectedPattern(pattern);
    setShowPatternModal(true);
  };

  const handleReleasePattern = async (notes: {
    recognition: string;
    impact: string;
    intention: string;
  }) => {
    if (!selectedPattern) return;

    const { error } = await supabase
      .from("user_patterns")
      .update({
        is_released: true,
        released_at: new Date().toISOString(),
        recognition_note: notes.recognition,
        impact_note: notes.impact,
        release_intention: notes.intention,
      })
      .eq("id", selectedPattern.id);

    if (error) {
      toast.error("Could not release pattern");
      return;
    }

    setPatterns(patterns.map(p => p.id === selectedPattern.id ? { ...p, is_released: true } : p));
    setShowPatternModal(false);
    setSelectedPattern(null);
    toast.success("Pattern released with intention");
  };

  const handleDeletePattern = async (id: string) => {
    const { error } = await supabase
      .from("user_patterns")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Could not remove pattern");
      return;
    }

    setPatterns(patterns.filter(p => p.id !== id));
  };

  const handleAddQuality = async (qualityName: string) => {
    if (!user) {
      toast.error("Sign in to cultivate qualities");
      return;
    }

    const { data, error } = await supabase
      .from("user_qualities")
      .insert({ user_id: user.id, quality_name: qualityName })
      .select()
      .single();

    if (error) {
      toast.error("Could not add quality");
      return;
    }

    setQualities([...qualities, data]);
    setNewQualityInput("");
    setShowAddQuality(false);
    toast.success("Quality added for cultivation");
  };

  const handleOpenQualityCultivate = (quality: Quality) => {
    setSelectedQuality(quality);
    setShowQualityModal(true);
  };

  const handleCultivateQuality = async (notes: { practice: string; gratitude: string }) => {
    if (!selectedQuality || !user) return;

    // Log the practice
    await supabase.from("quality_practice_logs").insert({
      user_id: user.id,
      quality_id: selectedQuality.id,
      practice_note: notes.practice,
      gratitude_note: notes.gratitude || null,
    });

    // Update progress
    const newProgress = Math.min(selectedQuality.progress + 25, 100);

    const { error } = await supabase
      .from("user_qualities")
      .update({ progress: newProgress, is_cultivated: newProgress >= 100 })
      .eq("id", selectedQuality.id);

    if (error) {
      toast.error("Could not update quality");
      return;
    }

    setQualities(qualities.map(q =>
      q.id === selectedQuality.id ? { ...q, progress: newProgress } : q
    ));

    setShowQualityModal(false);
    setSelectedQuality(null);

    if (newProgress >= 100) {
      toast.success("Quality fully cultivated!");
    } else {
      toast.success("Practice logged! Keep cultivating.");
    }
  };

  const handleDeleteQuality = async (id: string) => {
    const { error } = await supabase
      .from("user_qualities")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Could not remove quality");
      return;
    }

    setQualities(qualities.filter(q => q.id !== id));
  };

  const handleDeconstruct = async () => {
    if (!visionInput.trim()) {
      toast.error("Enter a vision to deconstruct");
      return;
    }

    if (!user) {
      toast.error("Sign in to save visions");
      return;
    }

    setIsDeconstructing(true);

    // Simulate AI deconstruction with meaningful steps
    setTimeout(async () => {
      const steps = [
        `Define what "${visionInput}" looks like when achieved`,
        "Identify the core skill or habit required",
        "Break into 3 micro-goals for this week",
        "Schedule one small action for today",
        "Create an environment that supports this vision",
        "Find accountability through sharing or tracking",
      ];

      setDeconstructedSteps(steps);

      // Save to database
      await supabase.from("user_visions").insert({
        user_id: user.id,
        vision_text: visionInput,
        deconstructed_steps: steps,
      });

      setIsDeconstructing(false);
      toast.success("Vision deconstructed");
    }, 1000);
  };

  const handleMoodCheck = () => {
    if (!user) {
      toast.error("Sign in to track your mood");
      return;
    }
    setShowMoodModal(true);
  };

  const unreleased = patterns.filter(p => !p.is_released);
  const released = patterns.filter(p => p.is_released);

  return (
    <>
      <MoodCheckModal isOpen={showMoodModal} onClose={() => setShowMoodModal(false)} />
      <PatternReleaseModal
        isOpen={showPatternModal}
        onClose={() => {
          setShowPatternModal(false);
          setSelectedPattern(null);
        }}
        patternName={selectedPattern?.pattern_name || ""}
        onComplete={handleReleasePattern}
      />
      <QualityCultivateModal
        isOpen={showQualityModal}
        onClose={() => {
          setShowQualityModal(false);
          setSelectedQuality(null);
        }}
        qualityName={selectedQuality?.quality_name || ""}
        onComplete={handleCultivateQuality}
      />
      <AppLayout>
        {/* Daily Focus Card */}
        <div className="mt-4">
          <div className="card-embrace relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-label">DAILY FOCUS</span>
            </div>

            <blockquote className="font-serif italic text-2xl md:text-3xl text-foreground leading-relaxed">
              "{currentQuote}"
            </blockquote>

            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-secondary/30 blur-2xl" />
          </div>

          <button
            onClick={handleMoodCheck}
            className="btn-embrace-outline w-full mt-6"
          >
            HOW ARE YOU FEELING NOW?
          </button>
        </div>

        {/* Gratitude Link Section */}
        <section className="mt-8">
          <Link
            to="/gratitude"
            className="card-embrace flex items-center gap-4 hover:border-primary/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-success-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif italic text-lg text-foreground">
                Gratitude Journal
              </h3>
              <p className="text-sm text-muted-foreground">
                Cultivate gratitude through daily reflections
              </p>
            </div>
          </Link>
        </section>

        {/* Deconstruct section */}
        <section className="mt-10">
          <h2 className="text-label mb-6">DECONSTRUCT A VISION</h2>

          <div className="card-embrace">
            <input
              type="text"
              value={visionInput}
              onChange={(e) => setVisionInput(e.target.value)}
              placeholder="e.g. Master a deep flow state..."
              className="input-embrace mb-4"
            />
            <button
              onClick={handleDeconstruct}
              disabled={isDeconstructing}
              className="btn-embrace w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              {isDeconstructing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  DECONSTRUCTING...
                </>
              ) : (
                "DECONSTRUCT"
              )}
            </button>
          </div>

          {deconstructedSteps.length > 0 && (
            <div className="mt-4 space-y-2 animate-fade-in">
              {deconstructedSteps.map((step, i) => (
                <div
                  key={i}
                  className="card-embrace py-4 flex items-start gap-3"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="text-primary font-semibold">{i + 1}.</span>
                  <span className="font-serif italic text-foreground">{step}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Patterns section */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-label">PATTERNS FOR RELEASE</h2>
            <button
              onClick={() => setShowAddPattern(!showAddPattern)}
              className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-secondary/50 rounded-xl p-4 mb-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How to release a pattern:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Recognize when and where it shows up</li>
              <li>Reflect on its impact on your life</li>
              <li>Choose what you embrace instead</li>
            </ol>
          </div>

          {showAddPattern && (
            <div className="card-embrace mb-4 animate-fade-in">
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newPatternInput}
                  onChange={(e) => setNewPatternInput(e.target.value)}
                  placeholder="Enter a pattern..."
                  className="input-embrace flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddPattern(newPatternInput)}
                />
                <button
                  onClick={() => handleAddPattern(newPatternInput)}
                  className="btn-embrace bg-primary text-primary-foreground px-4"
                >
                  ADD
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {defaultPatterns.filter(p => !patterns.some(up => up.pattern_name === p)).slice(0, 5).map(pattern => (
                  <button
                    key={pattern}
                    onClick={() => handleAddPattern(pattern)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary/50 transition-colors"
                  >
                    {pattern}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {unreleased.map((pattern) => (
              <div
                key={pattern.id}
                className="card-embrace flex items-center justify-between py-5"
              >
                <span className="font-serif italic text-lg text-foreground">
                  {pattern.pattern_name}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPatternRelease(pattern)}
                    className="p-2 rounded-full hover:bg-success/20 transition-colors text-success-foreground"
                    title="Begin release reflection"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePattern(pattern.id)}
                    className="p-2 rounded-full hover:bg-destructive/20 transition-colors text-muted-foreground"
                    title="Remove pattern"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {released.length > 0 && (
              <div className="pt-4 border-t border-border">
                <p className="text-label mb-3">RELEASED</p>
                {released.slice(0, 3).map((pattern) => (
                  <div
                    key={pattern.id}
                    className="flex items-center gap-2 text-muted-foreground py-2"
                  >
                    <Check className="w-4 h-4 text-success-foreground" />
                    <span className="font-serif italic line-through opacity-60">
                      {pattern.pattern_name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {patterns.length === 0 && (
              <p className="text-muted-foreground text-center py-4 font-serif italic">
                No patterns yet. Add one to begin releasing.
              </p>
            )}
          </div>
        </section>

        {/* Qualities section */}
        <section className="mt-10 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-label">QUALITIES TO CULTIVATE</h2>
            <button
              onClick={() => setShowAddQuality(!showAddQuality)}
              className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-secondary/50 rounded-xl p-4 mb-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How to cultivate a quality:</p>
            <p>Each tap opens a daily practice reflection. Progress is earned through mindful engagement, not quick clicks.</p>
          </div>

          {showAddQuality && (
            <div className="card-embrace mb-4 animate-fade-in">
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newQualityInput}
                  onChange={(e) => setNewQualityInput(e.target.value)}
                  placeholder="Enter a quality..."
                  className="input-embrace flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddQuality(newQualityInput)}
                />
                <button
                  onClick={() => handleAddQuality(newQualityInput)}
                  className="btn-embrace bg-primary text-primary-foreground px-4"
                >
                  ADD
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {defaultQualities.filter(q => !qualities.some(uq => uq.quality_name === q)).slice(0, 5).map(quality => (
                  <button
                    key={quality}
                    onClick={() => handleAddQuality(quality)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary/50 transition-colors"
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {qualities.map((quality) => (
              <button
                key={quality.id}
                onClick={() => handleOpenQualityCultivate(quality)}
                className={cn(
                  "card-embrace text-center py-4 relative overflow-hidden transition-all hover:scale-[1.02]",
                  quality.progress >= 100 && "ring-2 ring-success-foreground"
                )}
              >
                {/* Progress bar */}
                <div
                  className="absolute bottom-0 left-0 h-1 bg-primary/40 transition-all duration-500"
                  style={{ width: `${quality.progress}%` }}
                />
                <span className="font-serif italic text-foreground">
                  {quality.quality_name}
                </span>
                {quality.progress > 0 && quality.progress < 100 && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    {quality.progress}%
                  </span>
                )}
                {quality.progress >= 100 && (
                  <Check className="w-4 h-4 text-success-foreground mx-auto mt-1" />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteQuality(quality.id); }}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/20 transition-colors opacity-0 hover:opacity-100"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </button>
            ))}
          </div>

          {qualities.length === 0 && (
            <p className="text-muted-foreground text-center py-4 font-serif italic">
              No qualities yet. Add one to begin cultivating.
            </p>
          )}
        </section>
      </AppLayout>
    </>
  );
};

export default Daily;
