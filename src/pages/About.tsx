import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, Heart, Moon, Wind, BookOpen, Target, Sparkles, Users,
  MessageCircle, Calendar, BarChart3, Shield, Lightbulb, Flower2,
  Compass, Star, Zap, Clock, Award, Smile, Music, Eye, Leaf, Sun,
  ArrowLeft, ExternalLink, Check
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState, useCallback } from "react";

const features = [
  { icon: Brain, name: "Mood Tracker", desc: "Log & analyze emotions" },
  { icon: BookOpen, name: "Guided Journals", desc: "Structured reflection" },
  { icon: Wind, name: "Breathing Exercises", desc: "Calm your mind" },
  { icon: Moon, name: "Sleep Stories", desc: "Drift off peacefully" },
  { icon: Target, name: "Goal Setting", desc: "Track your progress" },
  { icon: Sparkles, name: "Daily Affirmations", desc: "Positive mindset" },
  { icon: Heart, name: "Gratitude Practice", desc: "Appreciate life" },
  { icon: Users, name: "Community Support", desc: "Connect with others" },
  { icon: MessageCircle, name: "AI Companion", desc: "24/7 support" },
  { icon: Calendar, name: "Habit Builder", desc: "Build routines" },
  { icon: BarChart3, name: "Progress Insights", desc: "Visual analytics" },
  { icon: Shield, name: "Crisis Resources", desc: "When you need help" },
  { icon: Lightbulb, name: "CBT Techniques", desc: "Evidence-based tools" },
  { icon: Flower2, name: "Mindfulness", desc: "Present moment" },
  { icon: Compass, name: "Life Assessment", desc: "Self-discovery" },
  { icon: Star, name: "Achievements", desc: "Celebrate wins" },
  { icon: Zap, name: "Quick Relief", desc: "Instant calm tools" },
  { icon: Clock, name: "Reminders", desc: "Stay consistent" },
  { icon: Award, name: "Challenges", desc: "Growth activities" },
  { icon: Smile, name: "Emotion Wheel", desc: "Identify feelings" },
  { icon: Music, name: "Sound Therapy", desc: "Healing sounds" },
  { icon: Eye, name: "Visualization", desc: "Mental imagery" },
  { icon: Leaf, name: "Nature Sounds", desc: "Environmental calm" },
  { icon: Sun, name: "Morning Rituals", desc: "Start right" },
];

// Group features into slides of 6
const featureSlides = [];
for (let i = 0; i < features.length; i += 6) {
  featureSlides.push(features.slice(i, i + 6));
}

const programs = [
  { name: "Anxiety Relief", audience: "Those with worry & stress" },
  { name: "Depression Support", audience: "Mood challenges" },
  { name: "Stress Management", audience: "High-pressure lives" },
  { name: "Self-Esteem Building", audience: "Confidence growth" },
  { name: "Relationship Health", audience: "Connection skills" },
  { name: "Grief & Loss", audience: "Processing loss" },
  { name: "Anger Management", audience: "Emotional regulation" },
  { name: "Sleep Improvement", audience: "Better rest" },
  { name: "Addiction Recovery", audience: "Breaking habits" },
  { name: "Trauma Healing", audience: "Processing past" },
  { name: "ADHD Support", audience: "Focus strategies" },
  { name: "OCD Management", desc: "Intrusive thoughts" },
  { name: "Eating Disorders", audience: "Healthy relationship with food" },
  { name: "Social Anxiety", audience: "Connection comfort" },
  { name: "PTSD Recovery", audience: "Trauma processing" },
  { name: "Bipolar Support", audience: "Mood stability" },
];

const About = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoplayPlugin = useRef(
    Autoplay({
      delay: 4000,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
      stopOnFocusIn: true,
    })
  );

  const handleSlideChange = useCallback((api: any) => {
    if (api) {
      setCurrentSlide(api.selectedScrollSnap());
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <a 
            href="https://thrive-mental.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <span className="text-sm font-medium">Visit Flagship</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-12">
        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">
            Discover ThriveMT
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive mental wellness platform with professional support, AI-powered tools, and evidence-based programs.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <a href="https://thrive-mental.com" target="_blank" rel="noopener noreferrer">
              Visit thrive-mental.com <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </section>

        {/* 24 Features Carousel */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-center">24-Feature Wellness Toolkit</h2>
          <div className="relative px-8">
            <Carousel
              plugins={[autoplayPlugin.current]}
              opts={{
                loop: true,
                align: "start",
              }}
              className="w-full"
              setApi={(api) => {
                if (api) {
                  api.on("select", () => handleSlideChange(api));
                  handleSlideChange(api);
                }
              }}
            >
              <CarouselContent>
                {featureSlides.map((slide, slideIndex) => (
                  <CarouselItem key={slideIndex} className="basis-full">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {slide.map((f) => (
                        <div 
                          key={f.name} 
                          className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card/50 border border-border/30 text-center"
                        >
                          <f.icon className="w-6 h-6 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{f.name}</p>
                            <p className="text-xs text-muted-foreground">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {featureSlides.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? "bg-primary" : "bg-border"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 16 Programs */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-center">16 Specialized Programs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {programs.map((p) => (
              <div key={p.name} className="p-3 rounded-lg bg-card/50 border border-border/30">
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.audience}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Additional Services */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Professional Support</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-4 text-center space-y-2">
                <Users className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold">Licensed Therapy</h3>
                <p className="text-xs text-muted-foreground">Connect with certified mental health professionals</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-4 text-center space-y-2">
                <Target className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold">Wellness Coaching</h3>
                <p className="text-xs text-muted-foreground">Personal guidance for mental wellness goals</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-4 text-center space-y-2">
                <MessageCircle className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold">AI Companion "Henry"</h3>
                <p className="text-xs text-muted-foreground">24/7 supportive AI conversation partner</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Basic */}
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-4 space-y-3">
                <div className="text-center">
                  <h3 className="font-semibold">Basic</h3>
                  <p className="text-2xl font-bold">Free</p>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> Core wellness tools</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> Daily check-ins</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> Community access</li>
                </ul>
              </CardContent>
            </Card>

            {/* Gold */}
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-4 space-y-3">
                <div className="text-center">
                  <h3 className="font-semibold">Gold</h3>
                  <p className="text-2xl font-bold">$5<span className="text-sm font-normal">/mo</span></p>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> All Basic features</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> Full program library</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> Advanced analytics</li>
                </ul>
              </CardContent>
            </Card>

            {/* Platinum */}
            <Card className="bg-primary/10 border-primary/50 relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                Recommended
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="text-center">
                  <h3 className="font-semibold text-primary">Platinum</h3>
                  <p className="text-2xl font-bold">$10<span className="text-sm font-normal">/mo</span></p>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> All Gold features</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> 1-on-1 coaching</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> Priority support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-6">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <a href="https://thrive-mental.com" target="_blank" rel="noopener noreferrer">
              Explore ThriveMT <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </section>
      </main>
    </div>
  );
};

export default About;
