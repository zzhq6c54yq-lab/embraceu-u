import { cn } from "@/lib/utils";

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
      {/* Refined lotus-embrace logo */}
      <div 
        className="relative animate-float" 
        style={{ width: s.width, height: s.height }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Warm gradient for outer petals */}
            <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(30, 60%, 58%)" />
              <stop offset="100%" stopColor="hsl(25, 50%, 48%)" />
            </linearGradient>
            
            {/* Soft coral gradient for inner elements */}
            <linearGradient id="innerGradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="hsl(20, 70%, 68%)" />
              <stop offset="100%" stopColor="hsl(15, 60%, 55%)" />
            </linearGradient>
            
            {/* Golden center gradient */}
            <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(35, 80%, 70%)" />
              <stop offset="100%" stopColor="hsl(30, 60%, 55%)" />
            </radialGradient>

            {/* Subtle glow */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Outer embrace circle - thin elegant ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#petalGradient)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />
          
          {/* Left embracing arm */}
          <path
            d="M20 75 Q15 50, 35 30 Q45 20, 50 22"
            stroke="url(#petalGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
          />
          
          {/* Right embracing arm */}
          <path
            d="M80 75 Q85 50, 65 30 Q55 20, 50 22"
            stroke="url(#petalGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
          />
          
          {/* Inner lotus petals - left */}
          <path
            d="M50 55 Q35 45, 32 35 Q32 28, 45 38 Q50 42, 50 55Z"
            fill="url(#innerGradient)"
            opacity="0.85"
          />
          
          {/* Inner lotus petals - right */}
          <path
            d="M50 55 Q65 45, 68 35 Q68 28, 55 38 Q50 42, 50 55Z"
            fill="url(#innerGradient)"
            opacity="0.85"
          />
          
          {/* Center petal - heart-like */}
          <path
            d="M50 60 Q42 50, 42 42 Q42 35, 50 44 Q58 35, 58 42 Q58 50, 50 60Z"
            fill="url(#centerGradient)"
          />
          
          {/* Small accent dot at bottom */}
          <circle
            cx="50"
            cy="78"
            r="3"
            fill="url(#petalGradient)"
            opacity="0.6"
          />
        </svg>
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
