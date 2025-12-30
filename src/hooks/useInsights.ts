import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface InsightsResponse {
  insights: string[];
  generated_at: string;
  period_days: number;
}

export const useInsights = (periodDays: number = 30) => {
  return useQuery<InsightsResponse>({
    queryKey: ['insights', periodDays],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-insights`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ period_days: periodDays }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate insights");
      }

      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 48 * 60 * 60 * 1000, // 48 hours
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
