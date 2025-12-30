import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Loader2, Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AdminAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AdminAccessModal = ({ open, onOpenChange, onSuccess }: AdminAccessModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear form when modal opens
  useEffect(() => {
    if (open) {
      setEmail("");
      setPassword("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Sign in with email/password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (!data.session) {
        setError("Failed to create session");
        setIsLoading(false);
        return;
      }

      // Verify admin role by calling the edge function
      const { error: adminError } = await supabase.functions.invoke('fetch-admin-stats');

      if (adminError) {
        // Sign out if not an admin
        await supabase.auth.signOut();
        setError("Access denied: Admin privileges required");
        setIsLoading(false);
        return;
      }

      toast.success("Admin access granted!");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Admin login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Admin Access
          </DialogTitle>
          <DialogDescription>
            Sign in with your admin account to access the dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="pl-10"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                setEmail("");
                setPassword("");
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAccessModal;
