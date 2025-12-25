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
        {/* Mini logo */}
        <div className="relative w-10 h-8">
          <svg
            viewBox="0 0 100 75"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="archGradientMini" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(30, 55%, 55%)" />
                <stop offset="100%" stopColor="hsl(25, 45%, 50%)" />
              </linearGradient>
              <linearGradient id="heartGradientMini" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="hsl(15, 70%, 70%)" />
                <stop offset="100%" stopColor="hsl(15, 60%, 60%)" />
              </linearGradient>
            </defs>
            <path
              d="M15 72 C15 30, 35 10, 50 10 C65 10, 85 30, 85 72"
              stroke="url(#archGradientMini)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M50 55 C50 55, 38 45, 38 38 C38 32, 43 28, 50 35 C57 28, 62 32, 62 38 C62 45, 50 55, 50 55Z"
              fill="url(#heartGradientMini)"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-serif italic text-lg text-foreground leading-tight">
            embraceU
          </span>
          <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground">
            BY THRIVE MT
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2">
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
                  <div className="px-2 py-1.5 text-sm font-medium text-foreground">
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
              <DropdownMenuItem onClick={handleSignOut}>
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
