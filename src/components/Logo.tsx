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
    "2xl": { width: 700, height: 420 },
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
        {/* EmbraceU logo with integrated text */}
        <div 
          className={cn(
            "relative animate-float md:scale-110 lg:scale-125",
            enableAdminAccess && "cursor-pointer hover:scale-105 transition-transform"
          )}
          style={{ width: s.width, height: s.height, maxWidth: "95vw" }}
          onClick={handleLogoClick}
        >
          <img
            src={logoImage}
            alt="EmbraceU logo - hands embracing a heart"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Optional tagline */}
        {showTagline && (
          <div className="flex flex-col items-center -mt-24 md:-mt-28">
            <p 
              className="text-xl tracking-[0.2em] uppercase text-muted-foreground font-medium animate-text-shimmer"
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
