import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-embrace.png";
import thriveMtIcon from "@/assets/thrive-mt-icon.png";
import AdminAccessModal from "@/components/AdminAccessModal";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  isExiting?: boolean;
  enableAdminAccess?: boolean;
}

const Logo = ({ className, showTagline = false, size = "md", isExiting = false, enableAdminAccess = false }: LogoProps) => {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAdminAuth();
  
  const sizes = {
    sm: { width: 140, height: 70 },
    md: { width: 240, height: 120 },
    lg: { width: 400, height: 200 },
    xl: { width: 600, height: 300 },
    "2xl": { width: 900, height: 540 },
  };

  const s = sizes[size];

  const handleLogoClick = () => {
    if (!enableAdminAccess) return;
    
    if (isAdmin) {
      // Already admin, go directly to admin page
      navigate("/admin");
    } else {
      // Show access code modal
      setShowAdminModal(true);
    }
  };

  const handleAdminAccessSuccess = () => {
    navigate("/admin");
  };

  return (
    <>
      <div className={cn("flex flex-col items-center", className)}>
        {/* Logo with centered alignment */}
        <div 
          className={cn(
            "relative animate-float flex items-center justify-center",
            size === "sm" && "w-32 h-16",
            size === "md" && "w-48 h-24",
            size === "lg" && "w-64 h-32",
            size === "xl" && "w-80 h-40",
            size === "2xl" && "w-[85vw] max-w-[600px] h-auto",
            enableAdminAccess && "cursor-pointer hover:scale-105 transition-transform"
          )}
          onClick={handleLogoClick}
        >
          <img
            src={logoImage}
            alt="EmbraceU logo - hands embracing a heart"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Optional tagline - single instance with icon */}
        {showTagline && (
          <div className="flex flex-col items-center mt-4">
            <p 
              className="text-lg md:text-xl tracking-[0.2em] uppercase text-muted-foreground font-medium animate-text-shimmer"
            >
              THE POWER OF PRESENCE
            </p>
            <p 
              className="text-sm md:text-base italic text-muted-foreground/80 mt-2 flex items-center gap-2" 
              style={{ 
                fontFamily: "'Playfair Display', serif",
                textShadow: "0 1px 8px hsl(210 30% 50% / 0.25)"
              }}
            >
              by Thrive MT
              <img 
                src={thriveMtIcon} 
                alt="Thrive MT" 
                className={cn(
                  "w-5 h-5 object-contain drop-shadow-md",
                  isExiting && "animate-spin-once"
                )} 
              />
            </p>
          </div>
        )}
      </div>

      <AdminAccessModal
        open={showAdminModal}
        onOpenChange={setShowAdminModal}
        onSuccess={handleAdminAccessSuccess}
      />
    </>
  );
};

export default Logo;
