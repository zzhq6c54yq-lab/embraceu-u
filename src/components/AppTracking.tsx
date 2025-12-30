import { useSessionTracking } from "@/hooks/useSessionTracking";
import { useAppUsageTracking } from "@/hooks/useAppUsageTracking";

export const AppTracking = () => {
  useSessionTracking();
  useAppUsageTracking();
  return null;
};
