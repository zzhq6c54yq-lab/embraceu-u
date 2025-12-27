import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff, Wifi, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";

export const OfflineIndicator = () => {
  const { isOnline, wasOffline } = useOnlineStatus();

  // Don't show anything if online and wasn't recently offline
  if (isOnline && !wasOffline) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-all duration-300",
        isOnline
          ? "bg-success text-success-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Back online — syncing your entries</span>
        </>
      ) : (
        <>
          <CloudOff className="h-4 w-4" />
          <span>You're offline — entries saved locally</span>
        </>
      )}
    </div>
  );
};
