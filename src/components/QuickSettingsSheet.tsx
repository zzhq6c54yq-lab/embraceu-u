import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings, Sun, Moon, Bell, BellOff, 
  Volume2, VolumeX, User, LogOut, Crown,
  ChevronRight, Palette
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuickSettingsSheetProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const QuickSettingsSheet = ({ trigger, open, onOpenChange }: QuickSettingsSheetProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isPremium } = usePremium();
  const [isDark, setIsDark] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [nickname, setNickname] = useState("Friend");

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDark(theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches));
    
    const sound = localStorage.getItem("soundEnabled");
    setSoundEnabled(sound !== "false");

    const notifications = localStorage.getItem("notificationsEnabled");
    setNotificationsEnabled(notifications !== "false");
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("user_id", user.id)
        .single();
      if (data) setNickname(data.nickname);
    };
    fetchProfile();
  }, [user]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    toast.success(`Switched to ${newTheme ? "dark" : "light"} mode`);
  };

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem("notificationsEnabled", String(newValue));
    toast.success(`Notifications ${newValue ? "enabled" : "disabled"}`);
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("soundEnabled", String(newValue));
    toast.success(`Sound ${newValue ? "enabled" : "disabled"}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const settingsItems = [
    {
      icon: isDark ? Moon : Sun,
      label: isDark ? "Dark Mode" : "Light Mode",
      description: "Toggle theme",
      action: toggleTheme,
      toggle: isDark,
      onToggle: toggleTheme,
    },
    {
      icon: notificationsEnabled ? Bell : BellOff,
      label: "Notifications",
      description: notificationsEnabled ? "Enabled" : "Disabled",
      toggle: notificationsEnabled,
      onToggle: toggleNotifications,
    },
    {
      icon: soundEnabled ? Volume2 : VolumeX,
      label: "Sounds",
      description: soundEnabled ? "Enabled" : "Disabled",
      toggle: soundEnabled,
      onToggle: toggleSound,
    },
  ];

  const navigationItems = [
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Palette, label: "Themes", path: "/profile", premium: true },
    { icon: Crown, label: "Pro Features", path: "/pro" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side="right" className="w-[320px] sm:w-[360px] p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Quick Settings
          </SheetTitle>
        </SheetHeader>

        {/* User Info */}
        {user && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{nickname}</p>
                <div className="flex items-center gap-1">
                  {isPremium && (
                    <span className="text-[10px] font-bold bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Quick Toggles */}
        <div className="px-6 py-4 space-y-2">
          <p className="text-label mb-3">QUICK TOGGLES</p>
          {settingsItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-3 rounded-xl bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <Switch
                checked={item.toggle}
                onCheckedChange={item.onToggle}
              />
            </div>
          ))}
        </div>

        <Separator />

        {/* Navigation */}
        <div className="px-6 py-4 space-y-2">
          <p className="text-label mb-3">QUICK ACCESS</p>
          {navigationItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                onOpenChange?.(false);
                navigate(item.path);
              }}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                "bg-card/50 hover:bg-card"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                {item.premium && !isPremium && (
                  <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    PRO
                  </span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Sign Out */}
        {user && (
          <div className="px-6 pb-6">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        )}

        {!user && (
          <div className="px-6 pb-6">
            <Button
              className="w-full"
              onClick={() => {
                onOpenChange?.(false);
                navigate("/auth");
              }}
            >
              Sign In
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default QuickSettingsSheet;
