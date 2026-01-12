import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import Logo from "@/components/Logo";
import { Sparkles, Heart, Wind, BookOpen, ArrowLeft } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  nickname: z.string().min(1, "Please enter a nickname").optional(),
});

const features = [
  { icon: Heart, label: "Daily Intentions" },
  { icon: Wind, label: "Breathwork" },
  { icon: Sparkles, label: "AI Coach" },
  { icon: BookOpen, label: "Personal Library" },
];

type AuthMode = "login" | "signup" | "forgot" | "reset";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(
    searchParams.get("mode") === "login" ? "login" : "signup"
  );
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = mode === "login";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";

  useEffect(() => {
    // Check for password reset token in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");
    
    if (accessToken && type === "recovery") {
      setMode("reset");
    }
  }, []);

  useEffect(() => {
    // Check if already logged in (skip for reset mode)
    if (isReset) return;
    
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
      } else if (session && !isReset) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isReset]);

  // Update mode when URL changes
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "login") setMode("login");
    else if (urlMode === "signup") setMode("signup");
  }, [searchParams]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Check your email for the reset link");
      setMode("login");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated successfully!");
      // Clear the hash from URL
      window.history.replaceState(null, "", window.location.pathname);
      navigate("/dashboard");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = authSchema.safeParse({
      email,
      password,
      nickname: isLogin ? undefined : nickname,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Welcome back!");
      } else {
        // For signup, we need to look up the referrer's user_id if a code is provided
        let referredBy: string | undefined;
        
        if (referralCode.trim()) {
          // Look up the referrer by their referral code
          const { data: referrerProfile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('referral_code', referralCode.toLowerCase().trim())
            .single();
          
          if (referrerProfile) {
            referredBy = referrerProfile.user_id;
          }
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/daily`,
            data: {
              nickname: nickname || "Friend",
              referred_by: referredBy,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Try logging in.");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Your presence is confirmed!");
      }
    } catch (error: any) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password View
  if (isForgot) {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-8">
        <div className="absolute inset-0 gradient-warm opacity-30 pointer-events-none" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full">
          <div className="flex justify-center mb-6">
            <Logo size="md" />
          </div>

          <button
            onClick={() => setMode("login")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to login</span>
          </button>

          <div className="text-center mb-8">
            <h1 className="font-serif italic text-3xl md:text-4xl text-foreground mb-3">
              Reset Password
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
            <div>
              <label className="text-label block mb-2">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="input-embrace"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-embrace mt-2 w-full disabled:opacity-50"
            >
              {isLoading ? "..." : "SEND RESET LINK"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Reset Password View (after clicking email link)
  if (isReset) {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-8">
        <div className="absolute inset-0 gradient-warm opacity-30 pointer-events-none" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full">
          <div className="flex justify-center mb-6">
            <Logo size="md" />
          </div>

          <div className="text-center mb-8">
            <h1 className="font-serif italic text-3xl md:text-4xl text-foreground mb-3">
              Create New Password
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
            <div>
              <label className="text-label block mb-2">NEW PASSWORD</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="input-embrace"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-embrace mt-2 w-full disabled:opacity-50"
            >
              {isLoading ? "..." : "UPDATE PASSWORD"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 gradient-warm opacity-30 pointer-events-none" />
      
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif italic text-3xl md:text-4xl text-foreground mb-3">
            {isLogin ? "Welcome Back" : "Begin Your Journey"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLogin ? "Return to your personal sanctuary" : "Create your account to unlock your full potential"}
          </p>
        </div>

        {/* Social proof */}
        {!isLogin && (
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center">
                  <span className="text-xs">✨</span>
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Join 10,000+ mindful souls</span>
          </div>
        )}

        {/* Features preview for signup */}
        {!isLogin && (
          <div className="grid grid-cols-4 gap-2 mb-8">
            {features.map((feature) => (
              <div key={feature.label} className="flex flex-col items-center text-center p-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">{feature.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <div>
              <label className="text-label block mb-2">NICKNAME</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="How shall we call you?"
                className="input-embrace"
                autoComplete="name"
              />
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="text-label block mb-2">REFERRAL CODE <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Friend's referral code"
                className="input-embrace"
                autoComplete="off"
              />
            </div>
          )}

          <div>
            <label className="text-label block mb-2">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="input-embrace"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-label block mb-2">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="input-embrace"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            {isLogin && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Forgot password?
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-embrace mt-2 w-full disabled:opacity-50"
          >
            {isLoading ? "..." : isLogin ? "SIGN IN" : "CREATE FREE ACCOUNT"}
          </button>
        </form>

        {/* Toggle auth mode */}
        <button
          onClick={() => setMode(isLogin ? "signup" : "login")}
          className="mt-6 text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {isLogin ? "New here? " : "Already have an account? "}
          <span className="text-primary font-medium">{isLogin ? "Create account" : "Sign in"}</span>
        </button>

        {/* Legal links */}
        {!isLogin && (
          <p className="mt-6 text-center text-muted-foreground text-xs">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;
