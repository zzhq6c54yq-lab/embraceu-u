import { Link, useNavigate } from "react-router-dom";
import { Moon, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AppHeaderProps {
  showClose?: boolean;
  onClose?: () => void;
  className?: string;
}

const AppHeader = ({ showClose = true, onClose, className }: AppHeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
          className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
          aria-label="Toggle theme"
        >
          <Moon className="w-5 h-5 text-primary" />
        </button>
        {user && (
          <button 
            onClick={handleSignOut}
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        {showClose && onClose && (
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
