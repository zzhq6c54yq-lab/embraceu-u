import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";


const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  nickname: z.string().min(1, "Please enter a nickname").optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/daily");
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/daily");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
    <div className="min-h-screen bg-background flex flex-col px-6 py-12">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 gradient-warm opacity-30 pointer-events-none" />
      
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif italic text-4xl md:text-5xl text-foreground mb-3">
            {isLogin ? "Welcome Back" : "Identify Your Presence"}
          </h1>
          <p className="text-label">
            {isLogin ? "RETURN TO YOUR SPACE" : "ESTABLISH YOUR ANCHOR IN THE SPACE"}
          </p>
        </div>

        {/* Email/password form below - social sign-in can be enabled later via Lovable Cloud dashboard */}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {!isLogin && (
            <div>
              <label className="text-label block mb-3">NICKNAME</label>
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
            <label className="text-label block mb-3">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your digital signature"
              className="input-embrace"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-label block mb-3">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your secret key"
              className="input-embrace"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-embrace mt-4 w-full disabled:opacity-50"
          >
            {isLoading ? "..." : isLogin ? "ENTER SPACE" : "CONFIRM IDENTITY"}
          </button>
        </form>

        {/* Toggle auth mode */}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-label text-center hover:text-foreground transition-colors"
        >
          {isLogin ? "NEW HERE? CREATE IDENTITY" : "ALREADY HAVE AN ACCOUNT? LOG IN"}
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
