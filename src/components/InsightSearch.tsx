import { useState } from "react";
import { Search, Sparkles, Loader2, BookmarkPlus, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import TextToSpeech from "@/components/TextToSpeech";

const quickPrompts = [
  "feeling anxious",
  "low motivation",
  "overwhelmed",
  "need self-compassion",
  "seeking clarity",
  "feeling stuck",
];

interface InsightSearchProps {
  onSaveInsight: (text: string, category: string) => void;
  onUpgradeClick: () => void;
}

const InsightSearch = ({ onSaveInsight, onUpgradeClick }: InsightSearchProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const parseInsights = (text: string): string[] => {
    return text
      .split("•")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setInsights([]);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ query: searchQuery }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate insights");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setInsights(parseInsights(fullText));
            }
          } catch {
            // Partial JSON, continue
          }
        }
      }

      // Final parse
      if (fullText) {
        setInsights(parseInsights(fullText));
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleQuickPrompt = (prompt: string) => {
    setQuery(prompt);
    handleSearch(prompt);
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 via-secondary/50 to-accent/10 rounded-2xl p-5 mb-6 border border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">What's on your mind?</h3>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type how you're feeling or what you're struggling with..."
          className="w-full bg-background/80 backdrop-blur-sm border border-border rounded-xl px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleQuickPrompt(prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs rounded-full bg-background/60 border border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-foreground transition-all disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && insights.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background/60 rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Personalized Insights
          </p>
          {insights.map((insight, i) => (
            <div
              key={i}
              className={cn(
                "bg-background/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 animate-fade-in",
                isLoading && i === insights.length - 1 && "opacity-70"
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <p className="font-serif italic text-foreground text-sm leading-relaxed">
                "{insight}"
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSaveInsight(insight, "AI-GENERATED")}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 mr-1" />
                  Save
                </Button>
                <TextToSpeech
                  text={insight}
                  size="sm"
                  onUpgradeClick={onUpgradeClick}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsightSearch;
