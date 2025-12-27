import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";
import Logo from "@/components/Logo";

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
    <div className={`min-h-screen bg-background flex flex-col items-center justify-start pt-0 transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 gradient-warm opacity-50 pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center px-6 py-0 text-center">
        {/* Logo with tagline - doubled size */}
        <Logo size="2xl" showTagline isExiting={isExiting} enableAdminAccess />

        {/* Description */}
        <p className="mt-8 text-muted-foreground text-italic-serif text-lg md:text-xl leading-relaxed max-w-md">
          A space to deconstruct patterns and cultivate your most intentional self.
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

        {/* Install PWA Button */}
        <Link
          to="/install"
          className="mt-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Install App</span>
        </Link>
      </div>

      {/* Footer with legal links */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 text-xs text-muted-foreground">
        <Link to="/privacy" className="hover:text-foreground transition-colors">
          Privacy Policy
        </Link>
        <Link to="/terms" className="hover:text-foreground transition-colors">
          Terms of Service
        </Link>
      </div>
    </div>
  );
};

export default Landing;
