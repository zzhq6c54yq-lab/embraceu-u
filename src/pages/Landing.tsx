import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Download, Heart, Wind, BookOpen, Sparkles, Star, Clock, Moon, Sun } from "lucide-react";
import Logo from "@/components/Logo";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Heart,
    title: "Daily Intentions",
    description: "Set meaningful goals and affirmations each day",
  },
  {
    icon: Wind,
    title: "Breathwork Rituals",
    description: "Calming exercises for stress relief and focus",
  },
  {
    icon: BookOpen,
    title: "Word Reframing",
    description: "Transform negative thoughts into positive growth",
  },
  {
    icon: Sparkles,
    title: "Personal Library",
    description: "Save insights and track your wellness journey",
  },
];

const dailyPractice = [
  { icon: Sun, label: "Morning Intention", time: "2 min" },
  { icon: Wind, label: "Breathwork", time: "5 min" },
  { icon: Moon, label: "Evening Gratitude", time: "3 min" },
];

const Landing = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleOpenSpace = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/intro");
    }, 600);
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <SEOHead 
        path="/" 
        title="EmbraceU | Self-Love, Mental Wellness & Personal Growth App"
        description="EmbraceU is your daily companion for self-love, mental wellness, and emotional health. Build confidence through mindfulness, mood tracking, breathwork, and personal development tools."
      />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 gradient-warm opacity-50 pointer-events-none" />

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-8 text-center">
        <h1 className="sr-only">EmbraceU - Mental Wellness & Self-Growth App</h1>
        <Logo size="2xl" showTagline isExiting={isExiting} enableAdminAccess />

        <p className="mt-6 text-muted-foreground text-italic-serif text-lg md:text-xl leading-relaxed max-w-md">
          Your daily space for self-love, emotional balance, and personal growth.
        </p>

        {/* Free badge */}
        <div className="mt-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-sm text-primary font-medium">✨ Free to start</span>
        </div>

        <Button
          onClick={handleOpenSpace}
          disabled={isExiting}
          className="btn-embrace mt-8 min-w-[200px]"
        >
          START YOUR JOURNEY
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </main>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-12 mt-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-center text-xl font-serif text-foreground mb-8">
            Everything you need for your wellness journey
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <feature.icon className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonial */}
      <section className="relative z-10 px-6 py-8 bg-secondary/30">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-accent fill-accent" />
            ))}
          </div>
          <blockquote className="text-italic-serif text-foreground text-lg leading-relaxed">
            "The wound is the place where the Light enters you."
          </blockquote>
          <cite className="text-muted-foreground text-sm mt-2 block not-italic">— Rumi</cite>
          <p className="text-xs text-muted-foreground mt-4">Join thousands on their self-love journey</p>
        </div>
      </section>

      {/* Daily Practice Preview */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-center text-xl font-serif text-foreground mb-2">
            Just 10 minutes a day
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Build habits that transform your mindset
          </p>
          
          <div className="flex justify-center gap-4">
            {dailyPractice.map((item, index) => (
              <div 
                key={item.label}
                className="flex flex-col items-center p-4 rounded-2xl bg-card/50 border border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-2">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <span className="text-xs font-medium text-foreground text-center">{item.label}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="relative z-10 px-6 py-12 bg-gradient-to-b from-transparent to-secondary/20">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-serif text-foreground mb-2">
            Upgrade when you're ready
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Start free, unlock Pro features anytime
          </p>
          
          <div className="flex justify-center gap-3 text-sm">
            <div className="px-4 py-2 rounded-xl bg-card/50 border border-border/50">
              <span className="text-muted-foreground">From </span>
              <span className="font-bold text-foreground">$3.49</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-accent/10 border border-accent/30">
              <span className="font-bold text-foreground">$24.99</span>
              <span className="text-muted-foreground"> lifetime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex flex-col items-center gap-4 px-6 py-8 mt-auto border-t border-border/30">
        <Link
          to="/install"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Install App</span>
        </Link>

        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/about" className="hover:text-foreground transition-colors">
            About ThriveMT
          </Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
        </div>
        
        <p className="text-[10px] text-muted-foreground/60 mt-2">
          Made with ❤️ by ThriveMT
        </p>
      </footer>
    </div>
  );
};

export default Landing;
