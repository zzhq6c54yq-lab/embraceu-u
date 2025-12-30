import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInsights } from "@/hooks/useInsights";
import { usePremium } from "@/hooks/usePremium";
import { Sparkles, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TextToSpeech from "@/components/TextToSpeech";

interface AIInsightsProps {
  onUpgradeClick?: () => void;
}

export default function AIInsights({ onUpgradeClick }: AIInsightsProps) {
  const { data, isLoading, isError, refetch, isFetching } = useInsights();
  const { isPremium } = usePremium();

  // Teaser for non-premium users
  if (!isPremium) {
    return (
      <Card className="card-embrace border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-serif italic">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Personal Insights
            <span className="text-xs font-sans bg-primary text-primary-foreground px-2 py-0.5 rounded-full ml-auto">
              PRO
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 opacity-60">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Unlock personalized insights powered by AI</span>
            </div>
            <ul className="text-sm text-muted-foreground ml-6 space-y-1">
              <li>• Mood pattern analysis</li>
              <li>• Personalized recommendations</li>
              <li>• Weekly growth summaries</li>
            </ul>
          </div>
          <Button 
            onClick={onUpgradeClick} 
            className="w-full btn-premium"
            size="sm"
          >
            Unlock AI Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="card-embrace">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-serif italic">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            Generating Insights...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="card-embrace border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-serif italic">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
            AI Personal Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Unable to generate insights right now.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-embrace border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-serif italic">
            <Sparkles className="w-5 h-5 text-primary" />
            Your Personal Insights
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {data?.insights?.map((insight, index) => (
            <li 
              key={index} 
              className="text-sm text-foreground leading-relaxed pl-1 border-l-2 border-primary/30 ml-1 py-0.5 flex items-start justify-between gap-2"
            >
              <span>{insight}</span>
              <TextToSpeech text={insight} size="sm" showLockForFree={false} />
            </li>
          ))}
        </ul>
        {data?.generated_at && (
          <p className="text-xs text-muted-foreground mt-4 text-right">
            Updated {new Date(data.generated_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
