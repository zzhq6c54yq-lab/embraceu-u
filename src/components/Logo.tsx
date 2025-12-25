import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, showTagline = false, size = "md" }: LogoProps) => {
  const sizes = {
    sm: { arch: 48, heart: 16, text: "text-xl" },
    md: { arch: 80, heart: 24, text: "text-4xl" },
    lg: { arch: 120, heart: 36, text: "text-5xl" },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Elegant embrace arch with heart */}
      <div className="relative mb-4 animate-float" style={{ width: s.arch, height: s.arch * 0.75 }}>
        <svg
          viewBox="0 0 100 75"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="archGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(30, 55%, 55%)" />
              <stop offset="50%" stopColor="hsl(35, 50%, 60%)" />
              <stop offset="100%" stopColor="hsl(25, 45%, 50%)" />
            </linearGradient>
            <linearGradient id="heartGradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="hsl(15, 70%, 70%)" />
              <stop offset="100%" stopColor="hsl(15, 60%, 60%)" />
            </linearGradient>
          </defs>
          
          {/* Embracing arch - elegant curved arms */}
          <path
            d="M15 72 C15 30, 35 10, 50 10 C65 10, 85 30, 85 72"
            stroke="url(#archGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Heart in center */}
          <path
            d="M50 55 C50 55, 38 45, 38 38 C38 32, 43 28, 50 35 C57 28, 62 32, 62 38 C62 45, 50 55, 50 55Z"
            fill="url(#heartGradient)"
          />
        </svg>
      </div>

      {/* Brand name */}
      <h1 className={cn("font-serif italic tracking-tight text-foreground", s.text)}>
        embraceU
      </h1>

      {/* Optional tagline */}
      {showTagline && (
        <>
          <div className="w-12 h-0.5 bg-primary/40 my-4 rounded-full" />
          <p className="text-label text-primary">THE POWER OF PRESENCE</p>
        </>
      )}
    </div>
  );
};

export default Logo;
