import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-embrace.png";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, showTagline = false, size = "md" }: LogoProps) => {
  const sizes = {
    sm: { width: 40, height: 40, text: "text-lg", taglineGap: "my-2" },
    md: { width: 72, height: 72, text: "text-3xl", taglineGap: "my-3" },
    lg: { width: 100, height: 100, text: "text-5xl", taglineGap: "my-4" },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* AI-generated embracing heart logo */}
      <div 
        className="relative animate-float" 
        style={{ width: s.width, height: s.height }}
      >
        <img
          src={logoImage}
          alt="embraceU logo - hands embracing a heart"
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </div>

      {/* Brand name with refined typography */}
      <h1 className={cn(
        "font-serif italic tracking-tight text-foreground mt-3",
        s.text
      )}>
        embrace<span className="font-normal not-italic text-primary">U</span>
      </h1>

      {/* Optional tagline */}
      {showTagline && (
        <>
          <div className={cn("w-10 h-px bg-primary/30 rounded-full", s.taglineGap)} />
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-medium">
            THE POWER OF PRESENCE
          </p>
        </>
      )}
    </div>
  );
};

export default Logo;
