import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, Heart, BookOpen, Users, MessageCircle, Video, Sparkles, 
  Music, Palette, Shield, Clock, Gamepad2, Moon, Mic, Target, 
  Lightbulb, Flower2, Award, Zap, HeartHandshake, GraduationCap, 
  Building2, Baby, Sunset, Siren, UtensilsCrossed, Truck, 
  Stethoscope, School, BadgeCheck, Ribbon, Home, ArrowLeft, 
  ExternalLink, Check
} from "lucide-react";
import thriveLogo from "@/assets/thrive-mt-icon.png";
import thriveQR from "@/assets/thrive-mt-qr.png";
import SEOHead from "@/components/SEOHead";

const features = [
  { icon: MessageCircle, name: "Between-Session Companion", desc: "AI-powered therapeutic support between therapy sessions" },
  { icon: Target, name: "User-led Progress", desc: "Track your progress and reach your wellness goals" },
  { icon: Users, name: "Family Resources", desc: "Support and resources for the whole family" },
  { icon: BookOpen, name: "Mental Wellness Library", desc: "Tools and resources for mental wellness" },
  { icon: Brain, name: "MirrorAI Companion", desc: "Your trauma-informed AI companion for processing emotions with compassion" },
  { icon: Award, name: "Lois Challenge", desc: "Participate in daily wellness challenges" },
  { icon: BookOpen, name: "Journaling", desc: "Journaling tools for reflection and growth" },
  { icon: Music, name: "Binaural Beats", desc: "Therapeutic music for relaxation and focus" },
  { icon: Lightbulb, name: "Workshops", desc: "Interactive workshops on wellness and personal growth" },
  { icon: Video, name: "Video Journaling", desc: "Create personal video diary entries" },
  { icon: Video, name: "Real-time Therapy", desc: "Connect with professional therapists instantly" },
  { icon: Flower2, name: "Holistic Wellness", desc: "Comprehensive approach to physical and mental wellness" },
  { icon: Zap, name: "Alternative Therapy", desc: "Explore alternative and complementary therapies" },
  { icon: HeartHandshake, name: "Community Support", desc: "Connect with a supportive community network" },
  { icon: Target, name: "Career Coaching", desc: "Professional guidance and career development" },
  { icon: Sparkles, name: "Meditation Studio", desc: "Comprehensive meditation studio with guided practices" },
  { icon: Moon, name: "Sleep Tracker", desc: "Track and improve your sleep patterns" },
  { icon: Gamepad2, name: "Brain Games & Quizzes", desc: "Cognitive games and quizzes for mental wellness" },
  { icon: Shield, name: "My Substance Abuse Sponsor", desc: "AA/NA style support with sponsor connection and sobriety tracking" },
  { icon: Mic, name: "Music Therapy", desc: "Complete music studio with recording, instruments and therapeutic effects" },
  { icon: Palette, name: "Art Therapy Studio", desc: "Therapeutic art studio with free draw, paint-by-numbers, mandala coloring and guided reflection" },
  { icon: Heart, name: "Dear Henry", desc: "Compassionate, anonymous advice from our mental health columnist" },
  { icon: MessageCircle, name: "Unburdened", desc: "Share thoughts anonymously and connect with others in a safe space" },
  { icon: Clock, name: "Daily Check-ins", desc: "Regular wellness check-ins to track your mental health journey" },
];

const programs = [
  { icon: Shield, name: "Military and Veterans", desc: "Resources tailored to the unique challenges faced by those who served", target: "Active duty, veterans, and military families" },
  { icon: GraduationCap, name: "The College Experience", desc: "Mental wellness support for academic and social pressures", target: "College students and young adults" },
  { icon: Building2, name: "Small Business", desc: "Resources for entrepreneurs dealing with business stress", target: "Small business owners and entrepreneurs" },
  { icon: Baby, name: "Adolescent Experience", desc: "Age-appropriate mental health support for teens", target: "Adolescents and their families" },
  { icon: Sunset, name: "The Golden Years", desc: "Mental wellness resources for seniors", target: "Seniors and their caregivers" },
  { icon: Siren, name: "First Responders", desc: "Specialized support for trauma and stress", target: "EMTs, firefighters, and emergency personnel" },
  { icon: UtensilsCrossed, name: "Hospitality Industry", desc: "Resources for high-stress service environments", target: "Restaurant and hospitality workers" },
  { icon: Truck, name: "Transportation Industry", desc: "Mental health support for life on the road", target: "Truck drivers and transportation workers" },
  { icon: Stethoscope, name: "Chronic Illness", desc: "Mental wellness support for ongoing health challenges", target: "Those managing chronic health conditions" },
  { icon: School, name: "Educators", desc: "Resources for classroom stress and burnout", target: "Teachers and educational staff" },
  { icon: BadgeCheck, name: "Law Enforcement", desc: "Specialized support for those who protect and serve", target: "Police officers and law enforcement" },
  { icon: Ribbon, name: "Cancer Support", desc: "Mental wellness for cancer journeys", target: "Cancer patients and survivors" },
  { icon: Home, name: "Single Parents Portal", desc: "Resources for the unique challenges of solo parenting", target: "Single parents and their families" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead 
        title="About ThriveMT - Mental Health Platform"
        description="Discover ThriveMT, the comprehensive mental health platform with 24 wellness tools, specialized programs, professional therapy, coaching, and AI support."
        path="/about"
      />
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

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-16">
        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Discover ThriveMT
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            The most comprehensive mental health platform designed to meet you where you are
          </p>
          <div className="flex justify-center pt-4">
            <img 
              src={thriveLogo} 
              alt="ThriveMT Logo" 
              className="w-24 h-24 md:w-32 md:h-32 object-contain"
            />
          </div>
        </section>

        {/* What ThriveMT Does */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
            What ThriveMT Does
          </h2>
          <p className="text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
            ThriveMT is an all-in-one mental wellness platform that combines professional therapy, life coaching, AI-powered support, and comprehensive self-care tools. Whether you're managing stress, working through trauma, or simply investing in your mental health, ThriveMT provides personalized resources, expert guidance, and a supportive community to help you thrive.
          </p>
        </section>

        {/* 24 Features */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
            Comprehensive Toolkit
          </h2>
          <p className="text-muted-foreground text-center">24 powerful tools designed for your mental wellness journey</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, idx) => (
              <Card key={idx} className="bg-card/80 border-border/50 hover:border-amber-500/30 transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <f.icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{f.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Specialized Programs */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
            Specialized Programs
          </h2>
          <p className="text-muted-foreground text-center">Community-based support tailored to your unique experience</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((p, idx) => (
              <Card key={idx} className="bg-card/80 border-border/50 hover:border-amber-500/30 transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <p.icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">For: {p.target}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* What Else We Offer */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
            What Else We Offer
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Professional Therapy */}
            <Card className="bg-purple-900/20 border-purple-500/30">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Video className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Professional Therapy</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with licensed therapists for one-on-one video sessions. Self-pay and insurance options available.
                </p>
                <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* Mental Wellness Coaching */}
            <Card className="bg-teal-900/20 border-teal-500/30">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-teal-500/20 flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-teal-400" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Mental Wellness Coaching</h3>
                <p className="text-sm text-muted-foreground">
                  Work with certified coaches on personal development, stress management, and life transitions.
                </p>
                <Button variant="outline" className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* AI Companion Henry */}
            <Card className="bg-card border-border/50">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">AI Companion "Henry"</h3>
                <p className="text-sm text-muted-foreground">
                  24/7 support from Henry, your trauma-informed AI companion for daily check-ins, coping tools, and encouragement.
                </p>
                <Button variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                  Meet Henry
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            {/* Basic */}
            <div className="w-44 h-44 rounded-full bg-card border-2 border-border/50 flex flex-col items-center justify-center text-center p-4 shadow-lg">
              <h3 className="font-semibold text-foreground">Basic</h3>
              <p className="text-2xl font-bold text-foreground">Free</p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-0.5">
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-500" /> Essential tools</li>
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-500" /> Virtual meetings</li>
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-500" /> Digital sponsor</li>
              </ul>
            </div>

            {/* Gold */}
            <div className="w-44 h-44 rounded-full bg-amber-500/10 border-2 border-amber-500/50 flex flex-col items-center justify-center text-center p-4 shadow-lg">
              <h3 className="font-semibold text-amber-500">Gold</h3>
              <p className="text-2xl font-bold text-foreground">$5<span className="text-sm font-normal">/mo</span></p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-0.5">
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-500" /> 5% bonus credits</li>
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-500" /> All wellness tools</li>
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-500" /> Workshop library</li>
              </ul>
            </div>

            {/* Platinum */}
            <div className="w-52 h-52 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/30 border-4 border-amber-500 flex flex-col items-center justify-center text-center p-4 shadow-xl relative">
              <span className="absolute -top-2 bg-amber-500 text-amber-950 text-xs font-semibold px-3 py-1 rounded-full">
                RECOMMENDED
              </span>
              <h3 className="font-semibold text-amber-500">Platinum</h3>
              <p className="text-2xl font-bold text-foreground">$10<span className="text-sm font-normal">/mo</span></p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-0.5">
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-500" /> 10% bonus credits</li>
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-500" /> Unlimited access</li>
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-500" /> Premium content</li>
              </ul>
            </div>
          </div>
        </section>

        {/* QR Code */}
        <section className="text-center space-y-4 py-8">
          <h2 className="text-xl font-semibold text-foreground">Scan to Download</h2>
          <div className="flex justify-center">
            <img 
              src={thriveQR} 
              alt="Download ThriveMT QR Code" 
              className="w-40 h-40 md:w-48 md:h-48 rounded-xl shadow-lg"
            />
          </div>
          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-amber-950">
            <a href="https://thrive-mental.com" target="_blank" rel="noopener noreferrer">
              Visit thrive-mental.com <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </section>
      </main>
    </div>
  );
};

export default About;
