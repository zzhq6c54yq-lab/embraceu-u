import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Users, Clock, Ticket, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

interface BetaCodeStats {
  id: string;
  code: string;
  max_uses: number;
  current_uses: number;
  trial_days: number;
  is_active: boolean;
  description: string | null;
  created_at: string;
  activeUsers: number;
  expiredUsers: number;
  avgExpiryDate: string | null;
}

interface BetaCodesSummary {
  totalRedemptions: number;
  totalActiveUsers: number;
  totalCapacity: number;
  utilizationPercent: number;
}

export const AdminBetaCodesCard = () => {
  const [codes, setCodes] = useState<BetaCodeStats[]>([]);
  const [summary, setSummary] = useState<BetaCodesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBetaStats = async () => {
    setIsLoading(true);
    try {
      const storedCodes = sessionStorage.getItem("admin_codes");
      const headers: Record<string, string> = {};

      if (storedCodes) {
        try {
          const parsedCodes = JSON.parse(storedCodes);
          headers['x-admin-code-1'] = parsedCodes.code1;
          headers['x-admin-code-2'] = parsedCodes.code2;
          headers['x-admin-code-3'] = parsedCodes.code3;
        } catch (e) {
          console.error("Failed to parse admin codes:", e);
        }
      }

      const { data, error } = await supabase.functions.invoke('fetch-beta-codes-stats', { headers });

      if (error) {
        console.error("Error fetching beta stats:", error);
        toast.error("Failed to fetch beta code stats");
        return;
      }

      setCodes(data.codes || []);
      setSummary(data.summary || null);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching beta stats:", error);
      toast.error("Failed to fetch beta code stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBetaStats();
  }, []);

  const getUsageColor = (current: number, max: number) => {
    const percent = (current / max) * 100;
    if (percent >= 90) return "text-destructive";
    if (percent >= 70) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            Beta Promo Codes
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchBetaStats}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">{summary.totalRedemptions}</div>
              <div className="text-xs text-muted-foreground">Total Redemptions</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-emerald-500">{summary.totalActiveUsers}</div>
              <div className="text-xs text-muted-foreground">Active Trials</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{summary.totalCapacity}</div>
              <div className="text-xs text-muted-foreground">Total Capacity</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-500">{summary.utilizationPercent}%</div>
              <div className="text-xs text-muted-foreground">Utilization</div>
            </div>
          </div>
        )}

        {/* Codes Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead className="text-center">Redemptions</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Avg Expiry</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell>
                    <div>
                      <code className="font-mono text-sm font-semibold">{code.code}</code>
                      {code.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{code.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="space-y-1">
                      <span className={`font-semibold ${getUsageColor(code.current_uses, code.max_uses)}`}>
                        {code.current_uses}/{code.max_uses}
                      </span>
                      <Progress 
                        value={(code.current_uses / code.max_uses) * 100} 
                        className="h-1.5 w-16 mx-auto"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-emerald-500">{code.activeUsers}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    {code.avgExpiryDate ? (
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {format(new Date(code.avgExpiryDate), "MMM d")}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    <Badge variant={code.is_active ? "default" : "secondary"}>
                      {code.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {codes.length === 0 && !isLoading && (
          <div className="text-center py-6 text-muted-foreground">
            No beta codes found
          </div>
        )}
      </CardContent>
    </Card>
  );
};
