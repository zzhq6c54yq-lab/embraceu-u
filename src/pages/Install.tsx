import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Share, MoreVertical, Plus, ArrowLeft, Smartphone, Monitor, Check } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/.test(userAgent)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-12">
      <SEOHead 
        title="Install EmbraceU App"
        description="Install EmbraceU on your device for the best mindfulness experience. Works offline, launches instantly, and provides a full-screen experience."
        path="/install"
      />
      <div className="absolute inset-0 gradient-warm opacity-30 pointer-events-none" />
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-label">BACK</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <Logo size="lg" />
          <h1 className="font-serif italic text-3xl md:text-4xl text-foreground mt-6 mb-3">
            Install EmbraceU
          </h1>
          <p className="text-muted-foreground">
            Add to your home screen for the best experience
          </p>
        </div>

        {isInstalled ? (
          <div className="card-embrace text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success-foreground" />
            </div>
            <h2 className="font-serif text-xl text-foreground mb-2">Already Installed</h2>
            <p className="text-muted-foreground text-sm">
              EmbraceU is ready on your device
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Platform-specific instructions */}
            {platform === "ios" && (
              <div className="card-embrace">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-6 h-6 text-primary" />
                  <h2 className="font-serif text-lg text-foreground">iPhone / iPad</h2>
                </div>
                <ol className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">1</span>
                    <span>Tap the <Share className="w-4 h-4 inline text-primary" /> Share button in Safari</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">2</span>
                    <span>Scroll down and tap <Plus className="w-4 h-4 inline text-primary" /> Add to Home Screen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">3</span>
                    <span>Tap Add to confirm</span>
                  </li>
                </ol>
              </div>
            )}

            {platform === "android" && (
              <div className="card-embrace">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-6 h-6 text-primary" />
                  <h2 className="font-serif text-lg text-foreground">Android</h2>
                </div>
                
                {deferredPrompt ? (
                  <Button onClick={handleInstall} className="w-full btn-embrace">
                    <Download className="w-4 h-4 mr-2" />
                    Install Now
                  </Button>
                ) : (
                  <ol className="space-y-4 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">1</span>
                      <span>Tap the <MoreVertical className="w-4 h-4 inline text-primary" /> menu in Chrome</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">2</span>
                      <span>Tap "Add to Home screen"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">3</span>
                      <span>Tap Add to confirm</span>
                    </li>
                  </ol>
                )}
              </div>
            )}

            {platform === "desktop" && (
              <div className="card-embrace">
                <div className="flex items-center gap-3 mb-4">
                  <Monitor className="w-6 h-6 text-primary" />
                  <h2 className="font-serif text-lg text-foreground">Desktop</h2>
                </div>
                
                {deferredPrompt ? (
                  <Button onClick={handleInstall} className="w-full btn-embrace">
                    <Download className="w-4 h-4 mr-2" />
                    Install App
                  </Button>
                ) : (
                  <ol className="space-y-4 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">1</span>
                      <span>Look for the install icon in your browser's address bar</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">2</span>
                      <span>Click "Install" when prompted</span>
                    </li>
                  </ol>
                )}
              </div>
            )}

            {/* Benefits */}
            <div className="card-embrace">
              <h3 className="font-serif text-lg text-foreground mb-4">Why Install?</h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  <span>Launch instantly from home screen</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  <span>Works offline</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  <span>Full screen experience</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  <span>Faster load times</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Install;
