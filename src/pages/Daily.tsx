import { useState } from "react";
import AppLayout from "@/components/AppLayout";

const dailyQuotes = [
  "I am no longer waiting for the right moment; I am the moment, arriving fully in this breath.",
  "My presence is my power. I choose to be here, fully, without apology.",
  "I release the weight of what was, and embrace the lightness of what is.",
  "Today, I cultivate patience with myself and curiosity about my growth.",
  "I am not my thoughts. I am the awareness that observes them.",
];

const Daily = () => {
  const [currentQuote] = useState(() => 
    dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)]
  );

  return (
    <AppLayout>
      {/* Daily Focus Card */}
      <div className="mt-4">
        <div className="card-embrace relative overflow-hidden">
          {/* Accent dot */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-label">DAILY FOCUS</span>
          </div>

          {/* Quote */}
          <blockquote className="font-serif italic text-2xl md:text-3xl text-foreground leading-relaxed">
            "{currentQuote}"
          </blockquote>

          {/* Decorative elements */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-secondary/30 blur-2xl" />
        </div>

        {/* Mood check button */}
        <button className="btn-embrace-outline w-full mt-6">
          HOW ARE YOU FEELING NOW?
        </button>
      </div>

      {/* Deconstruct section */}
      <section className="mt-10">
        <h2 className="text-label mb-6">DECONSTRUCT A VISION</h2>
        
        <div className="card-embrace">
          <input
            type="text"
            placeholder="e.g. Master a deep flow state..."
            className="input-embrace mb-4"
          />
          <button className="btn-embrace w-full bg-primary text-primary-foreground hover:bg-primary/90">
            DECONSTRUCT
          </button>
        </div>
      </section>

      {/* Patterns section */}
      <section className="mt-10">
        <h2 className="text-label mb-6">PATTERNS FOR RELEASE</h2>
        
        <div className="space-y-3">
          {["Procrastination", "Anxiety", "Self-Doubt"].map((pattern) => (
            <div 
              key={pattern}
              className="card-embrace flex items-center justify-between py-5"
            >
              <span className="font-serif italic text-lg text-foreground">
                {pattern}
              </span>
              <div className="w-12 h-0.5 bg-primary/40 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Qualities section */}
      <section className="mt-10 pb-8">
        <h2 className="text-label mb-6">QUALITIES TO CULTIVATE</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {["Patience", "Gratitude", "Focus", "Compassion"].map((quality) => (
            <div 
              key={quality}
              className="card-embrace text-center py-4"
            >
              <span className="font-serif italic text-foreground">
                {quality}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
};

export default Daily;
