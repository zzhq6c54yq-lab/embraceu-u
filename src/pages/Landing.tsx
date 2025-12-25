import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 gradient-warm opacity-50 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto text-center">
        {/* Logo with tagline */}
        <Logo size="lg" showTagline />

        {/* Description */}
        <p className="mt-8 text-muted-foreground text-italic-serif text-lg leading-relaxed">
          A space to deconstruct patterns and cultivate your most intentional self.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/auth")}
          className="btn-embrace mt-12 min-w-[200px]"
        >
          OPEN SPACE
        </button>

        {/* Footer credit */}
        <div className="mt-16 flex flex-col items-center gap-2">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            BY THRIVE MT
          </span>
          <div className="w-2 h-2 rounded-full bg-primary/30" />
        </div>
      </div>
    </div>
  );
};

export default Landing;
