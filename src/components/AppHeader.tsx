import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, LogOut, Calendar, BookOpen, User, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
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
import ProBadge from "@/components/ProBadge";
import UpgradeModal from "@/components/UpgradeModal";
import { AVATAR_OPTIONS } from "@/components/AvatarSelector";

interface AppHeaderProps {
  className?: string;
}

const AppHeader = ({ className }: AppHeaderProps) => {
  const { user, signOut } = useAuth();
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nickname, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setNickname(data.nickname);
        setAvatarUrl(data.avatar_url);
      }
    };

    fetchProfile();
  }, [user]);

  const avatarOption = AVATAR_OPTIONS.find(a => a.id === avatarUrl);

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
    <>
      <header className={cn(
        "flex items-center justify-between px-4 py-3 relative z-10",
        isPremium && "pro-header-glow border-b border-accent/20",
        className
      )}>
        <Link to="/daily" className="flex items-center gap-3">
          {/* Logo with premium glow */}
          <div className={cn(
            "relative w-9 h-9",
            isPremium && "animate-pro-glow-subtle rounded-full"
          )}>
            <img
              src={logoImage}
              alt="embraceU logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-serif italic text-lg leading-tight",
                isPremium ? "premium-gold-text" : "text-foreground"
              )}>
                embrace<span className={cn(
                  "font-normal not-italic",
                  isPremium ? "text-accent" : "text-primary"
                )}>U</span>
              </span>
              <ProBadge showGlow={isPremium} className="text-[9px] py-0.5 px-1.5" />
            </div>
            <span className={cn(
              "text-[8px] tracking-[0.12em] uppercase font-medium flex items-center gap-1",
              isPremium ? "text-accent/70" : "text-muted-foreground"
            )}>
              BY THRIVE MT
              <img src={thriveMtIcon} alt="Thrive MT" className="w-3 h-3 object-contain" />
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {!isPremium && user && (
            <button 
              onClick={() => setShowUpgrade(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:scale-[1.02] active:scale-[0.97] transition-all duration-200"
              aria-label="Upgrade to Pro"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Pro</span>
            </button>
          )}
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-secondary/50 transition-all duration-200 active:scale-[0.95]"
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
                  className="p-2 rounded-full hover:bg-secondary/50 transition-all duration-200 active:scale-[0.95] flex items-center gap-2"
                  aria-label="User menu"
                >
                  {avatarOption ? (
                    <span className="text-xl">{avatarOption.emoji}</span>
                  ) : (
                    <User className={cn("w-5 h-5", isPremium ? "text-accent" : "text-primary")} />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {nickname && (
                  <>
                    <div className="px-2 py-1.5 text-sm font-medium text-foreground font-serif italic flex items-center gap-2">
                      {nickname}
                      <ProBadge showGlow={false} className="text-[8px] py-0 px-1.5" />
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                {!isPremium && (
                  <>
                    <DropdownMenuItem onClick={() => setShowUpgrade(true)} className="text-accent">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </DropdownMenuItem>
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
      
      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </>
  );
};

export default AppHeader;
