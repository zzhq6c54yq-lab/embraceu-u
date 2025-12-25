import { usePremium } from "@/hooks/usePremium";

const AdBanner = () => {
  const { isPremium } = usePremium();

  if (isPremium) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2">
      <div className="max-w-lg mx-auto">
        <div className="bg-muted/80 backdrop-blur-sm border border-border/20 rounded-lg py-3 px-4 flex items-center justify-center relative">
          <span className="absolute top-1 right-2 text-[10px] text-muted-foreground/50 uppercase tracking-wider">
            Ad
          </span>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Ad Space • Support us by upgrading to Pro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
