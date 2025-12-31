import { useState, useEffect } from "react";
import { LogOut, Settings } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";
import ProfileSettings from "@/components/ProfileSettings";
import AvatarSelector from "@/components/AvatarSelector";
import { AvatarDisplay } from "@/components/avatar";
import { AchievementBadges } from "@/components/AchievementBadges";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { isPremium, openCustomerPortal } = usePremium();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, avatar_url, created_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setNickname(profile.nickname || "");
        setAvatarUrl(profile.avatar_url);
        if (profile.created_at) {
          setMemberSince(
            new Date(profile.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          );
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Until next time");
    navigate("/");
  };

  

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mt-2 mb-8 text-center">
        <div
          className={cn(
            "w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden",
            "border-2 border-primary/30 shadow-lg",
            isPremium && "animate-pro-glow-subtle"
          )}
        >
          <AvatarDisplay avatarUrl={avatarUrl} size={96} />
        </div>
        <h1 className="font-serif italic text-3xl text-foreground mb-1">
          {nickname || "Your Profile"}
        </h1>
        {memberSince && (
          <p className="text-sm text-muted-foreground">
            Member since {memberSince}
          </p>
        )}
      </div>

      {/* Achievement Badges Section */}
      <section className="mb-8">
        <h2 className="text-label mb-4">YOUR ACHIEVEMENTS</h2>
        <div className="card-embrace">
          <AchievementBadges />
        </div>
      </section>

      {/* Avatar Section */}
      <section className="mb-8">
        <h2 className="text-label mb-4">CHOOSE YOUR AVATAR</h2>
        <div className="card-embrace">
          <AvatarSelector
            currentAvatar={avatarUrl}
            onAvatarChange={(id) => setAvatarUrl(id)}
          />
        </div>
      </section>

      {/* Profile Settings Section */}
      <section className="mb-8">
        <h2 className="text-label mb-4">PROFILE SETTINGS</h2>
        <div className="card-embrace">
          <ProfileSettings />
        </div>
      </section>

      {/* Account Settings Section */}
      <section className="pb-20">
        <h2 className="text-label mb-4">ACCOUNT</h2>
        <div className="card-embrace space-y-3">
          {isPremium && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => openCustomerPortal()}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          <DeleteAccountDialog />
        </div>
      </section>
    </AppLayout>
  );
};

export default Profile;
