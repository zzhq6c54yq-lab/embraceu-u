import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 gradient-warm opacity-50 pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center">
        {/* Logo with tagline - doubled size */}
        <Logo size="2xl" showTagline />

        {/* Description */}
        <p className="mt-8 text-muted-foreground text-italic-serif text-lg md:text-xl leading-relaxed max-w-md">
          A space to deconstruct patterns and cultivate your most intentional self.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/intro")}
          className="btn-embrace mt-10 min-w-[200px] flex items-center justify-center gap-2"
        >
          OPEN SPACE
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Landing;
