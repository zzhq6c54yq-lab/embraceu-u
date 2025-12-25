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
import logoImage from "@/assets/logo-embrace.png";
import thriveMtIcon from "@/assets/thrive-mt-icon.png";

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
        {/* AI-generated mini logo */}
        <div className="relative w-9 h-9">
          <img
            src={logoImage}
            alt="embraceU logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-serif italic text-lg text-foreground leading-tight">
            embrace<span className="font-normal not-italic text-primary">U</span>
          </span>
          <span className="text-[8px] tracking-[0.12em] uppercase text-muted-foreground font-medium flex items-center gap-1">
            BY THRIVE MT
            <img src={thriveMtIcon} alt="Thrive MT" className="w-3 h-3 object-contain" />
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
