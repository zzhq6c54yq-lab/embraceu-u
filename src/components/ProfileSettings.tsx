import { useState } from "react";
import { User, Mail, Lock, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    // Validate email
    const result = emailSchema.safeParse(newEmail);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return;
    }

    if (newEmail === user?.email) {
      setEmailError("New email must be different from current email");
      return;
    }

    setIsChangingEmail(true);

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) {
        throw error;
      }

      toast({
        title: "Confirmation Email Sent",
        description: "Please check your new email address to confirm the change.",
      });
      setNewEmail("");
    } catch (error: any) {
      console.error("Error updating email:", error);
      setEmailError(error.message || "Failed to update email");
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Validate new password
    const result = passwordSchema.safeParse(newPassword);
    if (!result.success) {
      setPasswordError(result.error.errors[0].message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        throw error;
      }

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      setPasswordError(error.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Profile Info */}
      <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">{user?.email}</p>
          <p className="text-sm text-muted-foreground">Account Email</p>
        </div>
      </div>

      {/* Email Change Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Change Email</h3>
        </div>
        
        <form onSubmit={handleEmailChange} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="newEmail" className="text-muted-foreground">New Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setEmailError("");
              }}
              placeholder="Enter new email"
              className="bg-secondary border-border"
            />
          </div>
          
          {emailError && (
            <p className="text-sm text-destructive">{emailError}</p>
          )}
          
          <Button 
            type="submit" 
            disabled={!newEmail || isChangingEmail}
            className="w-full"
          >
            {isChangingEmail ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Update Email
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Password Change Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Change Password</h3>
        </div>
        
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-muted-foreground">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError("");
              }}
              placeholder="Enter new password"
              className="bg-secondary border-border"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-muted-foreground">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError("");
              }}
              placeholder="Confirm new password"
              className="bg-secondary border-border"
            />
          </div>
          
          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}
          
          <Button 
            type="submit" 
            disabled={!newPassword || !confirmPassword || isChangingPassword}
            className="w-full"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Update Password
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
