import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NebulaBackgroundProps {
  className?: string;
  animated?: boolean;
}

const NebulaBackground = ({ className = "", animated = true }: NebulaBackgroundProps) => {
  const [nebulaUrl, setNebulaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNebula = async () => {
      try {
        // Check localStorage cache first
        const cached = localStorage.getItem("nebula-bg-url");
        if (cached) {
          setNebulaUrl(cached);
          setIsLoading(false);
          return;
        }

        // Fetch from edge function
        const { data, error } = await supabase.functions.invoke("generate-nebula");
        
        if (error) {
          console.error("Error fetching nebula:", error);
          setIsLoading(false);
          return;
        }

        if (data?.url) {
          setNebulaUrl(data.url);
          localStorage.setItem("nebula-bg-url", data.url);
        }
      } catch (err) {
        console.error("Failed to fetch nebula:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNebula();
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* CSS Gradient fallback - always visible, fades when image loads */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${nebulaUrl && !isLoading ? "opacity-30" : "opacity-100"}`}
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 20% 80%, hsl(320, 70%, 45% / 0.6) 0%, transparent 50%),
            radial-gradient(ellipse 100% 120% at 80% 20%, hsl(280, 60%, 50% / 0.5) 0%, transparent 45%),
            radial-gradient(ellipse 80% 100% at 50% 50%, hsl(195, 80%, 50% / 0.4) 0%, transparent 40%),
            radial-gradient(ellipse 120% 80% at 10% 30%, hsl(270, 65%, 55% / 0.5) 0%, transparent 45%),
            radial-gradient(ellipse 100% 100% at 90% 70%, hsl(45, 80%, 60% / 0.3) 0%, transparent 40%),
            linear-gradient(135deg, hsl(260, 50%, 12%) 0%, hsl(280, 40%, 8%) 30%, hsl(320, 35%, 10%) 60%, hsl(260, 45%, 10%) 100%)
          `,
        }}
      />

      {/* AI-generated nebula image */}
      {nebulaUrl && (
        <div 
          className="absolute inset-0 transition-opacity duration-2000"
          style={{
            opacity: isLoading ? 0 : 1,
          }}
        >
          <img
            src={nebulaUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              animation: animated ? "nebula-drift 30s ease-in-out infinite" : "none",
              transform: "scale(1.1)",
            }}
            onError={() => {
              // Clear cache on error
              localStorage.removeItem("nebula-bg-url");
              setNebulaUrl(null);
            }}
          />
        </div>
      )}

      {/* Animated aurora overlay for that "living" effect */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Aurora wave 1 */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              45deg, 
              transparent 20%, 
              hsl(320, 70%, 60% / 0.15) 35%, 
              hsl(280, 60%, 55% / 0.12) 50%, 
              hsl(195, 80%, 55% / 0.1) 65%, 
              transparent 80%
            )`,
            backgroundSize: "400% 400%",
            animation: animated ? "nebula-aurora 12s ease-in-out infinite" : "none",
          }}
        />
        
        {/* Aurora wave 2 */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              -45deg, 
              transparent 25%, 
              hsl(45, 80%, 60% / 0.08) 40%, 
              hsl(270, 50%, 55% / 0.1) 55%, 
              hsl(320, 60%, 55% / 0.12) 70%, 
              transparent 85%
            )`,
            backgroundSize: "400% 400%",
            animation: animated ? "nebula-aurora 15s ease-in-out infinite reverse" : "none",
            animationDelay: "2s",
          }}
        />

        {/* Brightness pulse */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, hsl(280, 50%, 70% / 0.1) 0%, transparent 60%)",
            animation: animated ? "nebula-pulse 8s ease-in-out infinite" : "none",
          }}
        />
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes nebula-drift {
          0%, 100% { 
            transform: scale(1.1) translate(0, 0); 
          }
          25% { 
            transform: scale(1.12) translate(-1%, 0.5%); 
          }
          50% { 
            transform: scale(1.1) translate(-0.5%, -0.5%); 
          }
          75% { 
            transform: scale(1.11) translate(0.5%, 0.3%); 
          }
        }
        
        @keyframes nebula-aurora {
          0% { background-position: 0% 50%; opacity: 0.8; }
          50% { background-position: 100% 50%; opacity: 1; }
          100% { background-position: 0% 50%; opacity: 0.8; }
        }
        
        @keyframes nebula-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default NebulaBackground;
