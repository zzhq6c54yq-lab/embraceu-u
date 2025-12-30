import { useState } from "react";
import { FileText, Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { exportProgressPDF, exportDataCSV } from "@/lib/exportUtils";
import { toast } from "sonner";

interface ExportProgressProps {
  onUpgradeClick?: () => void;
}

export default function ExportProgress({ onUpgradeClick }: ExportProgressProps) {
  const { isPremium } = usePremium();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      // Fetch all required data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];

      const [profileRes, moodsRes, ritualsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('nickname, current_streak, longest_streak, total_rituals_completed, total_patterns_released, total_moods_logged, total_insights_saved')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('mood_entries')
          .select('mood, note, recorded_at')
          .eq('user_id', user.id)
          .gte('recorded_at', startDateStr)
          .order('recorded_at', { ascending: false }),
        supabase
          .from('rituals_completed')
          .select('ritual_type, duration_seconds, completed_at')
          .eq('user_id', user.id)
          .gte('completed_at', startDateStr)
          .order('completed_at', { ascending: false }),
      ]);

      if (profileRes.error) throw profileRes.error;

      const exportData = {
        profile: profileRes.data,
        moods: moodsRes.data || [],
        rituals: ritualsRes.data || [],
        dateRange: {
          start: startDateStr,
          end: new Date().toISOString().split('T')[0],
        },
      };

      if (format === 'pdf') {
        exportProgressPDF(exportData);
        toast.success('PDF report downloaded!');
      } else {
        exportDataCSV(exportData);
        toast.success('CSV data exported!');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isPremium) {
    return (
      <Card className="card-embrace border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-serif italic">
            <FileText className="w-5 h-5 text-primary" />
            Export Your Data
            <span className="text-xs font-sans bg-primary text-primary-foreground px-2 py-0.5 rounded-full ml-auto">
              PRO
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Download your progress as PDF or CSV</span>
          </div>
          <Button 
            onClick={onUpgradeClick} 
            className="w-full btn-premium"
            size="sm"
          >
            Unlock Data Export
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-embrace">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-serif italic">
          <FileText className="w-5 h-5 text-primary" />
          Export Your Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Download your last 30 days of progress data
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            PDF Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
