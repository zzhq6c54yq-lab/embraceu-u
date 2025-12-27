import { useState, useEffect, useRef } from 'react';
import { X, Download, Share2, Trophy, Flame, Target, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface ImpactStats {
  user_id: string;
  nickname: string;
  current_streak: number;
  longest_streak: number;
  total_rituals_completed: number;
  total_patterns_released: number;
  total_moods_logged: number;
  total_insights_saved: number;
  total_activities: number;
  growth_rank: string;
}

interface ImpactWrapProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImpactWrap = ({ open, onOpenChange }: ImpactWrapProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !user) return;

    const fetchStats = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_impact_summary')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setStats(data as ImpactStats);
      }
      
      setIsLoading(false);
    };

    fetchStats();
  }, [open, user]);

  const downloadImage = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `thrivemt-growth-${new Date().getFullYear()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({ title: 'Downloaded!', description: 'Your Growth Wrap has been saved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to download image', variant: 'destructive' });
    }

    setIsDownloading(false);
  };

  const shareImage = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], 'thrivemt-growth.png', { type: 'image/png' });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My ThriveMT Growth',
            text: 'Check out my growth journey on ThriveMT!',
          });
        } else {
          // Fallback to download
          downloadImage();
        }
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to share', variant: 'destructive' });
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Champion':
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 'Warrior':
        return <Target className="w-8 h-8 text-orange-500" />;
      case 'Explorer':
        return <Flame className="w-8 h-8 text-blue-500" />;
      default:
        return <Sparkles className="w-8 h-8 text-purple-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 bg-transparent border-none overflow-hidden">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="aspect-[9/16] flex items-center justify-center bg-gradient-to-br from-primary/80 to-accent/80 rounded-3xl">
            <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* The shareable card */}
            <div
              ref={cardRef}
              className="aspect-[9/16] relative overflow-hidden rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, hsl(215 30% 12%) 0%, hsl(200 40% 20%) 50%, hsl(38 60% 25%) 100%)',
              }}
            >
              {/* Frosted glass overlay */}
              <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-b from-white/5 via-transparent to-black/20" />

              {/* Decorative elements */}
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-between h-full p-8 text-white">
                {/* Header */}
                <div className="text-center pt-6">
                  <p className="text-xs tracking-[0.3em] uppercase text-white/60 mb-2">
                    ThriveMT
                  </p>
                  <h2 className="text-2xl font-serif italic">
                    {new Date().getFullYear()} Growth Summary
                  </h2>
                </div>

                {/* Stats */}
                <div className="flex-1 flex flex-col items-center justify-center gap-8 py-8">
                  {/* Rank badge */}
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full border-2 border-white/30 flex items-center justify-center mb-4 mx-auto bg-white/10 backdrop-blur-sm">
                      {getRankIcon(stats?.growth_rank || 'Beginner')}
                    </div>
                    <p className="text-sm tracking-[0.2em] uppercase text-white/60">
                      Growth Rank
                    </p>
                    <p className="text-3xl font-serif italic mt-1">
                      {stats?.growth_rank || 'Beginner'}
                    </p>
                  </div>

                  {/* Total activities */}
                  <div className="text-center">
                    <p className="text-6xl font-bold tracking-tight">
                      {stats?.total_activities || 0}
                    </p>
                    <p className="text-sm tracking-[0.15em] uppercase text-white/70 mt-2">
                      Total Activities
                    </p>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="text-lg font-semibold">
                      {stats?.longest_streak || 0} day streak
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center pb-4">
                  <p className="text-sm text-white/50">
                    {stats?.nickname || 'Friend'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions below the card */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                onClick={downloadImage}
                disabled={isDownloading}
                className="flex-1 bg-white text-foreground hover:bg-white/90"
              >
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download
              </Button>
              <Button
                onClick={shareImage}
                variant="outline"
                className="flex-1 border-white/30 text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImpactWrap;
