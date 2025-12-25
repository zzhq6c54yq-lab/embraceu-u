import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Check, 
  Wind, 
  RefreshCw, 
  Compass, 
  BarChart3
} from "lucide-react";

const navItems = [
  { path: "/daily", label: "Daily", icon: Check },
  { path: "/breath", label: "Breath", icon: Wind },
  { path: "/reframe", label: "Reframe", icon: RefreshCw },
  { path: "/explore", label: "Explore", icon: Compass },
  { path: "/progress", label: "Progress", icon: BarChart3 },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-pb">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <RouterNavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                  "hover:bg-secondary/50",
                  isActive && "text-primary"
                )}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span 
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider transition-colors duration-200",
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
    </nav>
  );
};

export default BottomNav;
