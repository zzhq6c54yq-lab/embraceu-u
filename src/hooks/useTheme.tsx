import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePremium } from './usePremium';

export type ThemePreference = 'gold' | 'rose' | 'midnight' | 'emerald' | 'aurora';

const themeClasses: Record<ThemePreference, string> = {
  gold: 'theme-gold',
  rose: 'theme-rose',
  midnight: 'theme-midnight',
  emerald: 'theme-emerald',
  aurora: 'theme-aurora',
};

export const useTheme = () => {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [theme, setTheme] = useState<ThemePreference>('gold');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch theme from database on mount
  useEffect(() => {
    const fetchTheme = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data?.theme_preference) {
          const savedTheme = data.theme_preference as ThemePreference;
          setTheme(savedTheme);
          applyTheme(savedTheme);
        }
      } catch (err) {
        console.error('Error fetching theme:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheme();
  }, [user]);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: ThemePreference) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    Object.values(themeClasses).forEach((className) => {
      root.classList.remove(className);
    });

    // Add new theme class if not default
    if (newTheme !== 'gold') {
      root.classList.add(themeClasses[newTheme]);
    }
  }, []);

  // Update theme in database and apply
  const updateTheme = useCallback(async (newTheme: ThemePreference) => {
    if (!user) return;
    if (!isPremium && newTheme !== 'gold') return;

    setTheme(newTheme);
    applyTheme(newTheme);

    try {
      await supabase
        .from('profiles')
        .update({ theme_preference: newTheme })
        .eq('user_id', user.id);
    } catch (err) {
      console.error('Error updating theme:', err);
    }
  }, [user, isPremium, applyTheme]);

  return {
    theme,
    updateTheme,
    isLoading,
    isPremium,
  };
};
