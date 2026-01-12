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
  "/reframe": {
    tourStorageKey: "embraceu-reframe-tour-completed",
    pageName: "Word Reframing",
    quickTips: [
      { title: "Enter a Thought", tip: "Type any limiting word or belief you want to transform" },
      { title: "Shuffle Reframes", tip: "Tap the shuffle button to get different positive perspectives" },
      { title: "AI Reframe", tip: "Use AI to generate personalized reframes for complex thoughts" },
      { title: "Save Favorites", tip: "Save meaningful reframes to your library for later" },
      { title: "Quick Words", tip: "Try suggested trigger words for instant reframing" },
    ]
  },
  "/explore": {
    tourStorageKey: "embraceu-explore-tour-completed",
    pageName: "Daily Insights",
    quickTips: [
      { title: "Categories", tip: "Browse insights organized by themes like Presence, Action, Focus" },
      { title: "Save Insights", tip: "Bookmark insights that resonate with you" },
      { title: "Schedule", tip: "Set reminders to practice specific insights" },
      { title: "AI Coach", tip: "Chat with your AI coach for personalized guidance" },
      { title: "Listen", tip: "Use text-to-speech to hear insights read aloud" },
    ]
  },
  "/rituals": {
    tourStorageKey: "embraceu-rituals-tour-completed",
    pageName: "Daily Rituals",
    quickTips: [
      { title: "Build Rituals", tip: "Create personalized morning, midday, or evening routines" },
      { title: "Drag & Drop", tip: "Reorder ritual steps by dragging them" },
      { title: "Track Completion", tip: "Mark rituals complete to build consistency" },
      { title: "Templates", tip: "Start with suggested ritual templates" },
    ]
  },
  "/coach": {
    tourStorageKey: "embraceu-coach-tour-completed",
    pageName: "AI Wellness Coach",
    quickTips: [
      { title: "Start a Chat", tip: "Share what's on your mind or how you're feeling" },
      { title: "Quick Prompts", tip: "Use suggested prompts to start the conversation" },
      { title: "Conversation History", tip: "Access past conversations from the sidebar" },
      { title: "Personalized", tip: "Your coach learns from your patterns and preferences" },
    ]
  },
  "/duo": {
    tourStorageKey: "embraceu-duo-tour-completed",
    pageName: "Growth Partner",
    quickTips: [
      { title: "Connect", tip: "Share your code with a friend to link accounts" },
      { title: "Shared Streak", tip: "Build a growth streak together with your partner" },
      { title: "Partner Activities", tip: "Complete duo activities for mutual growth" },
      { title: "Privacy", tip: "Control what you share with mood sharing settings" },
    ]
  },
  "/challenge": {
    tourStorageKey: "embraceu-challenge-tour-completed",
    pageName: "Challenges",
    quickTips: [
      { title: "Join Challenges", tip: "Participate in multi-day growth challenges" },
      { title: "Daily Tasks", tip: "Complete each day's task to progress" },
      { title: "Reflections", tip: "Write reflections to deepen your learning" },
      { title: "Track Progress", tip: "See your challenge completion percentage" },
    ]
  },
  "/memory-lane": {
    tourStorageKey: "embraceu-memory-lane-tour-completed",
    pageName: "Memory Lane",
    quickTips: [
      { title: "Time Capsule", tip: "View highlights from your wellness journey" },
      { title: "Past Entries", tip: "Revisit gratitude entries and insights" },
      { title: "Growth Markers", tip: "See how far you've come over time" },
    ]
  },
  "/quick-rituals": {
    tourStorageKey: "embraceu-quick-rituals-tour-completed",
    pageName: "Quick Rituals",
    quickTips: [
      { title: "Micro-Practices", tip: "60-second rituals for busy moments" },
      { title: "Anywhere, Anytime", tip: "No equipment needed for these exercises" },
      { title: "Categories", tip: "Choose from calming, energizing, or grounding rituals" },
      { title: "Quick Start", tip: "Tap any card to begin immediately" },
    ]
  },
  "/dashboard": {
    tourStorageKey: "embraceu-dashboard-tour-completed",
    pageName: "Dashboard",
    quickTips: [
      { title: "Today's Journey", tip: "See your daily wellness tasks at a glance" },
      { title: "Quick Actions", tip: "Access your most-used features instantly" },
      { title: "Stats Overview", tip: "Track your streaks and progress" },
      { title: "Personalized", tip: "Dashboard adapts to your activity patterns" },
    ]
  },
  "/library": {
    tourStorageKey: "embraceu-library-tour-completed",
    pageName: "Your Library",
    quickTips: [
      { title: "Saved Content", tip: "Access all your saved insights and reframes" },
      { title: "Practice Mode", tip: "Mark insights as practiced when you apply them" },
      { title: "Filter & Sort", tip: "Organize by category or date saved" },
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
