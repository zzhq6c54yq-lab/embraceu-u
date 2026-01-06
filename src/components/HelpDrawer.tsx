import { useLocation, useNavigate } from "react-router-dom";
import { HelpCircle, PlayCircle, Lightbulb, BookOpen } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getHelpContentForRoute, getAllPageGuides } from "@/lib/helpContent";

interface HelpDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplayTour: () => void;
}

const HelpDrawer = ({ open, onOpenChange, onReplayTour }: HelpDrawerProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const helpContent = getHelpContentForRoute(location.pathname);
  const allGuides = getAllPageGuides();

  const handleReplayTour = () => {
    if (helpContent) {
      localStorage.removeItem(helpContent.tourStorageKey);
      onReplayTour();
      onOpenChange(false);
    }
  };

  const handleNavigateAndReplay = (path: string, storageKey: string) => {
    localStorage.removeItem(storageKey);
    navigate(path);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="flex items-center justify-center gap-2 font-serif italic text-xl">
            <HelpCircle className="w-5 h-5 text-primary" />
            Need Help?
          </DrawerTitle>
          {helpContent && (
            <DrawerDescription className="text-muted-foreground">
              Tips for {helpContent.pageName}
            </DrawerDescription>
          )}
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4 pb-6">
          {/* Replay Tour Button */}
          {helpContent && (
            <div className="mb-6">
              <Button
                onClick={handleReplayTour}
                variant="outline"
                className="w-full h-auto py-3 flex items-center gap-3 justify-start"
              >
                <PlayCircle className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Replay Tour</div>
                  <div className="text-xs text-muted-foreground">
                    Walk through {helpContent.pageName} features again
                  </div>
                </div>
              </Button>
            </div>
          )}

          {/* Quick Tips */}
          {helpContent && helpContent.quickTips.length > 0 && (
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <Lightbulb className="w-4 h-4" />
                Quick Tips
              </h3>
              <div className="space-y-2">
                {helpContent.quickTips.map((tip, index) => (
                  <div
                    key={index}
                    className="bg-secondary/50 rounded-lg p-3 border border-border/50"
                  >
                    <div className="font-medium text-sm text-foreground mb-0.5">
                      {tip.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tip.tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Page Guides */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <BookOpen className="w-4 h-4" />
              All Page Guides
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {allGuides.map((guide) => (
                <button
                  key={guide.path}
                  onClick={() => handleNavigateAndReplay(guide.path, guide.storageKey)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    location.pathname === guide.path
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-secondary/30 border-border/50 text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <div className="text-sm font-medium">{guide.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    View tour
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 pt-0">
          <DrawerClose asChild>
            <Button variant="ghost" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default HelpDrawer;
