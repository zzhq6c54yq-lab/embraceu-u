import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";
import Logo from "@/components/Logo";
import SEOHead from "@/components/SEOHead";

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
    <div className={`min-h-screen bg-background flex flex-col items-center pt-2 pb-12 transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <SEOHead 
        path="/" 
        title="EmbraceU | Self-Love, Mental Wellness & Personal Growth App"
        description="EmbraceU is your daily companion for self-love, mental wellness, and emotional health. Build confidence through mindfulness, mood tracking, breathwork, and personal development tools."
      />
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 gradient-warm opacity-50 pointer-events-none" />

      {/* Hero Section - at top */}
      <main className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Logo with tagline - doubled size */}
        <h1 className="sr-only">EmbraceU - Mental Wellness & Self-Growth App</h1>
        <Logo size="2xl" showTagline isExiting={isExiting} enableAdminAccess />

        {/* Description */}
        <p className="mt-8 text-muted-foreground text-italic-serif text-lg md:text-xl leading-relaxed max-w-md">
          Your daily space for self-love, emotional balance, and personal growth.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleOpenSpace}
          disabled={isExiting}
          className="btn-embrace mt-10 min-w-[200px] flex items-center justify-center gap-2"
        >
          OPEN SPACE
          <ArrowRight className="w-4 h-4" />
        </button>
      </main>

      {/* Footer with legal links - pushed to bottom */}
      <footer className="relative z-10 flex flex-col items-center gap-4 px-6 mt-auto">
        {/* Install PWA Button */}
        <Link
          to="/install"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Install App</span>
        </Link>

        {/* Legal links row */}
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
      </footer>
    </div>
  );
};

export default Landing;
