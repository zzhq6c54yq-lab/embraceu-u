import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-embrace.png";
import thriveMtIcon from "@/assets/thrive-mt-icon.png";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const Logo = ({ className, showTagline = false, size = "md" }: LogoProps) => {
  const sizes = {
    sm: { width: 140, height: 70 },
    md: { width: 240, height: 120 },
    lg: { width: 400, height: 200 },
    xl: { width: 600, height: 300 },
    "2xl": { width: 1200, height: 600 },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* EmbraceU logo with integrated text */}
      <div 
        className="relative animate-float" 
        style={{ width: s.width, height: s.height, maxWidth: "95vw" }}
      >
        <img
          src={logoImage}
          alt="EmbraceU logo - hands embracing a heart"
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </div>

      {/* Optional tagline */}
      {showTagline && (
        <div className="flex flex-col items-center -mt-48 md:-mt-52">
          <p 
            className="text-xl tracking-[0.2em] uppercase text-muted-foreground font-medium"
            style={{ textShadow: "0 2px 12px hsl(210 30% 50% / 0.3), 0 0 24px hsl(210 30% 70% / 0.2)" }}
          >
            THE POWER OF PRESENCE
          </p>
          <p 
            className="text-base italic text-muted-foreground/80 mt-1 flex items-center gap-2" 
            style={{ 
              fontFamily: "'Playfair Display', serif",
              textShadow: "0 1px 8px hsl(210 30% 50% / 0.25)"
            }}
          >
            by Thrive MT
            <img src={thriveMtIcon} alt="Thrive MT" className="w-5 h-5 object-contain drop-shadow-md" />
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
