import { useState, useEffect } from 'react';
import { Sparkles, Trophy, Flame, Heart, Star } from 'lucide-react';

interface DuoMotivationProps {
  streak: number;
  partnerName: string;
}

const milestones = [7, 14, 21, 30, 60, 90, 100, 180, 365];

const motivationalMessages = [
  "Together, you're building something beautiful.",
  "Two hearts, one journey of growth.",
  "Your commitment inspires each other every day.",
  "Side by side, you're unstoppable.",
  "Every day together is a victory.",
  "Your duo energy is powerful!",
  "Growing stronger, together.",
  "Partners in progress, friends in growth.",
];

const DuoMotivation = ({ streak, partnerName }: DuoMotivationProps) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Pick a random motivational message
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    setMessage(motivationalMessages[randomIndex]);
  }, [streak]);

  // Check if current streak is a milestone
  const isMilestone = milestones.includes(streak);
  const nextMilestone = milestones.find((m) => m > streak) || milestones[milestones.length - 1];

  const getMilestoneMessage = () => {
    if (streak >= 365) return "🏆 One year together! Legendary commitment!";
    if (streak >= 180) return "👑 Half a year! Your bond is unbreakable!";
    if (streak >= 100) return "💯 100 days! You've created a lasting habit!";
    if (streak >= 90) return "🌟 90 days! True transformation achieved!";
    if (streak >= 60) return "✨ 60 days! Your dedication is inspiring!";
    if (streak >= 30) return "🎉 30 days! A full month of growth together!";
    if (streak >= 21) return "🌱 21 days! Habit formed, keep going!";
    if (streak >= 14) return "💪 Two weeks strong! You're on fire!";
    if (streak >= 7) return "🔥 First week complete! Amazing start!";
    return null;
  };

  const milestoneMessage = getMilestoneMessage();

  return (
    <div className="space-y-4">
      {/* Milestone celebration */}
      {isMilestone && milestoneMessage && (
        <div className="card-embrace-premium p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent/20 to-accent/10 animate-pulse" />
          <div className="relative z-10">
            <Trophy className="w-8 h-8 mx-auto text-accent mb-2" />
            <p className="font-serif italic text-lg text-foreground">{milestoneMessage}</p>
          </div>
        </div>
      )}

      {/* Daily motivation */}
      <div className="card-embrace p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="font-serif italic text-foreground">{message}</p>
            <p className="text-xs text-muted-foreground mt-2">
              You & {partnerName} • {streak} days strong
            </p>
          </div>
        </div>
      </div>

      {/* Progress to next milestone */}
      {!isMilestone && nextMilestone > streak && (
        <div className="card-embrace p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="w-4 h-4 text-accent" />
              <span>Next milestone</span>
            </div>
            <span className="text-sm font-medium text-foreground">{nextMilestone} days</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(streak / nextMilestone) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {nextMilestone - streak} days to go!
          </p>
        </div>
      )}

      {/* Encouragement badges */}
      <div className="flex flex-wrap gap-2 justify-center">
        {streak >= 3 && (
          <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent flex items-center gap-1">
            <Heart className="w-3 h-3" /> Committed
          </span>
        )}
        {streak >= 7 && (
          <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent flex items-center gap-1">
            <Flame className="w-3 h-3" /> On Fire
          </span>
        )}
        {streak >= 30 && (
          <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent flex items-center gap-1">
            <Star className="w-3 h-3" /> Dedicated
          </span>
        )}
      </div>
    </div>
  );
};

export default DuoMotivation;