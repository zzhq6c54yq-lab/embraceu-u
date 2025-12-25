import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Wind, Sparkles, BookOpen } from "lucide-react";
import Logo from "@/components/Logo";
import thriveMtIcon from "@/assets/thrive-mt-icon.png";

const features = [
  {
    icon: Heart,
    title: "Daily Intentions",
    description: "Start each day with curated wisdom and focused purpose.",
  },
  {
    icon: Wind,
    title: "Breathwork Rituals",
    description: "Guided breathing patterns for calm, focus, and energy.",
  },
  {
    icon: Sparkles,
    title: "Word Reframing",
    description: "Transform limiting beliefs into empowering perspectives.",
  },
  {
    icon: BookOpen,
    title: "Personal Library",
    description: "Save and revisit insights that resonate with your journey.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 gradient-warm opacity-50 pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center">
        {/* Logo with tagline - 3x larger */}
        <Logo size="xl" showTagline />

        {/* By Thrive MT branding */}
        <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-1.5 mt-4">
          BY THRIVE MT
          <img src={thriveMtIcon} alt="Thrive MT" className="w-4 h-4 object-contain" />
        </span>

        {/* Description */}
        <p className="mt-8 text-muted-foreground text-italic-serif text-lg md:text-xl leading-relaxed max-w-md">
          A space to deconstruct patterns and cultivate your most intentional self.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/auth")}
          className="btn-embrace mt-10 min-w-[200px] flex items-center justify-center gap-2"
        >
          OPEN SPACE
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-12 md:py-16">
        <h2 className="text-label text-center mb-10">WHAT AWAITS YOU</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-embrace flex items-start gap-4 p-5"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-serif italic text-lg text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial/Quote Section */}
      <div className="relative z-10 px-6 py-12 md:py-16 bg-secondary/30">
        <div className="max-w-lg mx-auto text-center">
          <blockquote className="font-serif italic text-xl md:text-2xl text-foreground leading-relaxed">
            "The quality of your attention determines the quality of your life."
          </blockquote>
          <p className="text-label mt-4">— ANCIENT WISDOM</p>
        </div>
      </div>

      {/* Daily Practice Section */}
      <div className="relative z-10 px-6 py-12 md:py-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-label mb-4">YOUR DAILY PRACTICE</h2>
          <p className="text-muted-foreground font-serif italic mb-8">
            Consistency creates transformation. Begin with just five minutes a day.
          </p>
          
          <div className="space-y-3">
            <div className="card-embrace py-4 flex items-center justify-between">
              <span className="font-serif italic text-foreground">Morning Intention</span>
              <span className="text-xs text-muted-foreground">2 min</span>
            </div>
            <div className="card-embrace py-4 flex items-center justify-between">
              <span className="font-serif italic text-foreground">Breathwork Ritual</span>
              <span className="text-xs text-muted-foreground">5 min</span>
            </div>
            <div className="card-embrace py-4 flex items-center justify-between">
              <span className="font-serif italic text-foreground">Evening Reflection</span>
              <span className="text-xs text-muted-foreground">3 min</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/auth")}
            className="btn-embrace-outline mt-8"
          >
            START YOUR JOURNEY
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="sm" />
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-1.5">
            BY THRIVE MT
            <img src={thriveMtIcon} alt="Thrive MT" className="w-4 h-4 object-contain" />
          </span>
          <div className="w-2 h-2 rounded-full bg-primary/30" />
          <p className="text-xs text-muted-foreground max-w-xs">
            Crafted with intention for those seeking presence, purpose, and inner peace.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
