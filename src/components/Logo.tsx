import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-embrace.png";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, showTagline = false, size = "md" }: LogoProps) => {
  const sizes = {
    sm: { width: 120, height: 60 },
    md: { width: 200, height: 100 },
    lg: { width: 320, height: 160 },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* EmbraceU logo with integrated text */}
      <div 
        className="relative animate-float" 
        style={{ width: s.width, height: s.height }}
      >
        <img
          src={logoImage}
          alt="EmbraceU logo - hands embracing a heart"
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </div>

      {/* Optional tagline */}
      {showTagline && (
        <>
          <div className="w-10 h-px bg-primary/30 rounded-full my-3" />
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-medium">
            THE POWER OF PRESENCE
          </p>
        </>
      )}
    </div>
  );
};

export default Logo;
