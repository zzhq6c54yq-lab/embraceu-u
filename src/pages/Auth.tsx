import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import Logo from "@/components/Logo";
import { Sparkles, Heart, Wind, BookOpen } from "lucide-react";

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

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") === "login");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Update isLogin when URL changes
  useEffect(() => {
    setIsLogin(searchParams.get("mode") === "login");
  }, [searchParams]);

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/daily`,
            data: {
              nickname: nickname || "Friend",
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
          onClick={() => setIsLogin(!isLogin)}
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
