import { useSessionTracking } from "@/hooks/useSessionTracking";
import { useAppUsageTracking } from "@/hooks/useAppUsageTracking";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

export const AppTracking = () => {
  useSessionTracking();
  useAppUsageTracking();
  useVisitorTracking();
  return null;
};
