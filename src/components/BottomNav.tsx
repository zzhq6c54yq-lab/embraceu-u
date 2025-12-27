import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Check, 
  Wind, 
  RefreshCw, 
  Compass, 
  Heart,
  Sparkles
} from "lucide-react";

const navItems = [
  { path: "/daily", label: "Daily", icon: Check },
  { path: "/breath", label: "Breath", icon: Wind },
  { path: "/reframe", label: "Reframe", icon: RefreshCw },
  { path: "/explore", label: "Explore", icon: Compass },
  { path: "/gratitude", label: "Gratitude", icon: Sparkles },
  { path: "/challenge", label: "Challenge", icon: Heart },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      {/* Safe area padding for iOS notch/home indicator */}
      <div className="max-w-lg mx-auto px-1 sm:px-2">
        <div className="flex items-center justify-around py-1.5 sm:py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <RouterNavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-200",
                  "hover:bg-secondary/50 min-w-0",
                  isActive && "text-primary"
                )}
              >
                <Icon 
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 flex-shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span 
                  className={cn(
                    "text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider transition-colors duration-200 truncate",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </RouterNavLink>
            );
          })}
        </div>
      </div>
      {/* iOS safe area bottom padding */}
      <div className="h-safe-area-inset-bottom bg-card/95" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
};

export default BottomNav;
