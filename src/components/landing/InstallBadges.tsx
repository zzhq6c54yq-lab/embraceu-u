import { useState, useEffect } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallBadges = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Smartphone className="w-4 h-4" />
        <span>App installed</span>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <Button
        onClick={handleInstall}
        variant="outline"
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Install App
      </Button>
    );
  }

  // Show generic mobile app message when not installable
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <Smartphone className="w-4 h-4" />
        <span>Available as a web app</span>
      </div>
    </div>
  );
};
