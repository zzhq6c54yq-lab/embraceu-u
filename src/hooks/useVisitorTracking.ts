import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Generate or retrieve a persistent visitor ID
const getVisitorId = (): string => {
  const storageKey = 'embraceu_visitor_id';
  let visitorId = localStorage.getItem(storageKey);
  
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(storageKey, visitorId);
  }
  
  return visitorId;
};

export const useVisitorTracking = () => {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per session
    if (hasTracked.current) return;
    hasTracked.current = true;

    const trackVisit = async () => {
      try {
        const visitorId = getVisitorId();
        const pagePath = window.location.pathname;
        const userAgent = navigator.userAgent;
        const referrer = document.referrer || null;

        await supabase.from('site_visits').insert({
          visitor_id: visitorId,
          page_path: pagePath,
          user_agent: userAgent,
          referrer: referrer
        });

        console.log('[VisitorTracking] Visit logged');
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.error('[VisitorTracking] Error:', error);
      }
    };

    trackVisit();
  }, []);
};
