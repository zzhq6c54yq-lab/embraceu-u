import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, LogOut, Calendar, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

interface AppHeaderProps {
  className?: string;
}

const AppHeader = ({ className }: AppHeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchNickname = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setNickname(data.nickname);
      }
    };

    fetchNickname();
  }, [user]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Until next time");
    navigate("/");
  };

  return (
    <header className={cn("flex items-center justify-between px-4 py-3", className)}>
      <Link to="/daily" className="flex items-center gap-3">
        {/* Refined mini logo */}
        <div className="relative w-9 h-9">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="petalGradientMini" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(30, 60%, 58%)" />
                <stop offset="100%" stopColor="hsl(25, 50%, 48%)" />
              </linearGradient>
              <linearGradient id="innerGradientMini" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="hsl(20, 70%, 68%)" />
                <stop offset="100%" stopColor="hsl(15, 60%, 55%)" />
              </linearGradient>
              <radialGradient id="centerGradientMini" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(35, 80%, 70%)" />
                <stop offset="100%" stopColor="hsl(30, 60%, 55%)" />
              </radialGradient>
            </defs>
            
            {/* Left embracing arm */}
            <path
              d="M20 75 Q15 50, 35 30 Q45 20, 50 22"
              stroke="url(#petalGradientMini)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* Right embracing arm */}
            <path
              d="M80 75 Q85 50, 65 30 Q55 20, 50 22"
              stroke="url(#petalGradientMini)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* Center heart-lotus */}
            <path
              d="M50 60 Q40 48, 40 40 Q40 32, 50 42 Q60 32, 60 40 Q60 48, 50 60Z"
              fill="url(#centerGradientMini)"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-serif italic text-lg text-foreground leading-tight">
            embrace<span className="font-normal not-italic text-primary">U</span>
          </span>
          <span className="text-[8px] tracking-[0.12em] uppercase text-muted-foreground font-medium">
            BY THRIVE MT
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-1">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-primary" />
          ) : (
            <Moon className="w-5 h-5 text-primary" />
          )}
        </button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-2 rounded-full hover:bg-secondary/50 transition-colors flex items-center gap-2"
                aria-label="User menu"
              >
                <User className="w-5 h-5 text-primary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {nickname && (
                <>
                  <div className="px-2 py-1.5 text-sm font-medium text-foreground font-serif italic">
                    {nickname}
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => navigate("/space")}>
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/library")}>
                <BookOpen className="w-4 h-4 mr-2" />
                Library
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
