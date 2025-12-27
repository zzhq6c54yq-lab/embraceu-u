import { useState, useEffect, useCallback } from "react";

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  const handleOnline = useCallback(() => {
    if (!isOnline) {
      setWasOffline(true);
      // Reset the "was offline" flag after 5 seconds
      setTimeout(() => setWasOffline(false), 5000);
    }
    setIsOnline(true);
  }, [isOnline]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline };
};
