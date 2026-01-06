export interface QuickTip {
  title: string;
  tip: string;
}

export interface PageHelpContent {
  tourStorageKey: string;
  pageName: string;
  quickTips: QuickTip[];
}

export const pageHelpContent: Record<string, PageHelpContent> = {
  "/daily": {
    tourStorageKey: "embraceu-daily-tour-completed",
    pageName: "Daily Practice",
    quickTips: [
      { title: "Daily Focus", tip: "Start your day with an inspiring quote to set your intention" },
      { title: "Mood Check", tip: "Track how you're feeling throughout the day" },
      { title: "Vision Builder", tip: "Break down your goals into actionable steps" },
      { title: "Pattern Release", tip: "Let go of limiting beliefs that no longer serve you" },
      { title: "Quality Cultivation", tip: "Grow the positive qualities you want to embody" },
    ]
  },
  "/breath": {
    tourStorageKey: "embraceu-breath-tour-completed",
    pageName: "Breathing Exercises",
    quickTips: [
      { title: "Choose Your Rhythm", tip: "Select from calming, energizing, or balanced breathing patterns" },
      { title: "Visual Guide", tip: "Follow the animated circle to pace your breath" },
      { title: "Session Timer", tip: "Set your preferred session length" },
      { title: "Track Progress", tip: "Your completed sessions are saved automatically" },
    ]
  },
  "/gratitude": {
    tourStorageKey: "embraceu-gratitude-tour-completed",
    pageName: "Gratitude Journal",
    quickTips: [
      { title: "Daily Entries", tip: "Write what you're grateful for each day" },
      { title: "Build Streaks", tip: "Maintain consistency to build your gratitude streak" },
      { title: "Voice Journal", tip: "Use voice input for hands-free journaling (Pro)" },
      { title: "History", tip: "Review your past entries to see your growth" },
    ]
  },
  "/progress": {
    tourStorageKey: "embraceu-progress-tour-completed",
    pageName: "Your Progress",
    quickTips: [
      { title: "Activity Charts", tip: "See your wellness activities over time" },
      { title: "AI Insights", tip: "Get personalized patterns and suggestions" },
      { title: "Export Data", tip: "Download your progress as PDF or CSV (Pro)" },
      { title: "Mood Trends", tip: "Track how your mood changes over time" },
    ]
  },
};

export const getHelpContentForRoute = (pathname: string): PageHelpContent | null => {
  return pageHelpContent[pathname] || null;
};

export const getAllPageGuides = (): { path: string; name: string; storageKey: string }[] => {
  return Object.entries(pageHelpContent).map(([path, content]) => ({
    path,
    name: content.pageName,
    storageKey: content.tourStorageKey,
  }));
};
