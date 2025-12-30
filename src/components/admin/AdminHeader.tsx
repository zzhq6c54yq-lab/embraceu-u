import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Crown, Zap, Timer, AlertTriangle, RefreshCw, LogOut 
} from "lucide-react";
import { formatSessionTime, formatTimeAgo } from "@/lib/adminUtils";

interface AdminHeaderProps {
  lastUpdated: Date | null;
  sessionTimeRemaining: number | null;
  showTimeoutWarning: boolean;
  isLoadingData: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}

const AdminHeader = ({
  lastUpdated,
  sessionTimeRemaining,
  showTimeoutWarning,
  isLoadingData,
  onRefresh,
  onLogout
}: AdminHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-serif italic text-xl text-foreground flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Zap className="w-3 h-3 text-green-500" />
              Live updates enabled
              {lastUpdated && (
                <span className="text-xs">• Last sync: {formatTimeAgo(lastUpdated.toISOString())}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Session Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            showTimeoutWarning
              ? 'bg-amber-500/20 text-amber-600'
              : 'bg-muted text-muted-foreground'
          }`}>
            {showTimeoutWarning && <AlertTriangle className="w-3 h-3" />}
            <Timer className="w-3 h-3" />
            <span>{formatSessionTime(sessionTimeRemaining)}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoadingData}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
