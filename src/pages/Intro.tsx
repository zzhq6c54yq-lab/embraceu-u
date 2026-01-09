import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Wind, Sparkles, BookOpen } from "lucide-react";
import Logo from "@/components/Logo";
import SEOHead from "@/components/SEOHead";

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

const Intro = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead 
        title="Start Your Journey - Mindfulness & Personal Growth"
        description="Begin your intentional living journey with EmbraceU. Daily intentions, breathwork rituals, word reframing, and a personal library for your growth."
        path="/intro"
      />
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 gradient-warm opacity-50 pointer-events-none" />

      {/* Logo at Top */}
      <div className="relative z-10 flex justify-center pt-8 pb-4">
        <Logo size="lg" />
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-8 md:py-12">
        <h2 className="text-label text-center mb-10">WHAT AWAITS YOU</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-embrace flex items-start gap-4 p-5 animate-fade-in"
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
        </div>
      </div>

      {/* Auth CTA Section */}
      <div className="relative z-10 px-6 py-16 bg-gradient-to-b from-secondary/20 to-background">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Join 10,000+ mindful souls</span>
          </div>
          
          <h2 className="font-serif italic text-2xl md:text-3xl text-foreground mb-3">
            Your Sanctuary Awaits
          </h2>
          <p className="text-muted-foreground mb-8">
            Create your account to unlock personalized wellness tracking, guided sessions, and your growth journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/auth")}
              className="btn-embrace flex items-center justify-center gap-2"
            >
              CREATE FREE ACCOUNT
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/auth?mode=login")}
              className="btn-embrace-outline flex items-center justify-center gap-2"
            >
              SIGN IN
            </button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            ✨ Free forever • No credit card required
          </p>
        </div>
      </div>

      {/* Minimal footer */}
      <footer className="relative z-10 px-6 py-8 text-center">
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Crafted with intention for those seeking presence, purpose, and inner peace.
        </p>
      </footer>
    </div>
  );
};

export default Intro;
