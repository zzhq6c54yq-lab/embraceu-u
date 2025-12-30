import { Smartphone, Clock } from "lucide-react";
import { formatDuration } from "@/lib/adminUtils";
import type { UserInfo } from "@/types/admin";

interface AdminUserCardProps {
  user: UserInfo;
  onClick?: () => void;
}

const AdminUserCard = ({ user, onClick }: AdminUserCardProps) => {
  return (
    <div 
      className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="font-medium text-foreground text-sm">{user.nickname || "—"}</p>
        <span className="flex items-center gap-1 text-orange-500 text-sm">
          🔥 {user.current_streak}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Joined {new Date(user.created_at).toLocaleDateString()}
        {user.referral_count > 0 && ` • ${user.referral_count} referrals`}
      </p>
      <div className="flex items-center gap-3 mt-1.5">
        <span className={`flex items-center gap-1 text-xs ${
          user.pwa_installed ? 'text-green-600' : 'text-muted-foreground'
        }`}>
          <Smartphone className="w-3 h-3" />
          {user.pwa_installed ? 'PWA' : 'Web'}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {formatDuration(user.total_time_spent_seconds)}
        </span>
      </div>
    </div>
  );
};

export default AdminUserCard;
