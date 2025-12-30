import { Heart, Wind, Clock } from "lucide-react";
import { formatTimeAgo } from "@/lib/adminUtils";
import type { ActivityFeedItem } from "@/types/admin";

interface AdminActivityItemProps {
  item: ActivityFeedItem;
}

const AdminActivityItem = ({ item }: AdminActivityItemProps) => {
  const isMood = item.type === 'mood';
  
  return (
    <div className="p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
      {isMood ? (
        <Heart className="w-4 h-4 text-pink-500 flex-shrink-0" />
      ) : (
        <Wind className="w-4 h-4 text-cyan-500 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">
          {isMood ? `Mood: ${item.mood}` : `Ritual: ${item.ritual_type}`}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTimeAgo(item.created_at)}
        </p>
      </div>
    </div>
  );
};

export default AdminActivityItem;
