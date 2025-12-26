import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Download, Copy, Check, Sparkles, Twitter, Facebook, Linkedin } from "lucide-react";
import { toast } from "sonner";

interface ShareKindnessCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayNumber: number;
  title: string;
  description: string;
  reflection?: string | null;
  completedAt?: string;
}

const ShareKindnessCard = ({
  open,
  onOpenChange,
  dayNumber,
  title,
  description,
  reflection,
  completedAt,
}: ShareKindnessCardProps) => {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareText = `🌟 Day ${dayNumber} of 30 Days of Kindness Challenge\n\n💖 ${title}\n\n${reflection ? `My reflection: "${reflection}"\n\n` : ""}Join me in spreading kindness! #KindnessChallenge #EmbraceU #SpreadKindness`;
  
  const shareUrl = window.location.origin;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Day ${dayNumber}: ${title}`,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      handleCopyText();
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, "_blank", "width=550,height=420");
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, "_blank", "width=550,height=420");
  };

  const formattedDate = completedAt 
    ? new Date(completedAt).toLocaleDateString("en-US", { 
        month: "long", 
        day: "numeric", 
        year: "numeric" 
      })
    : new Date().toLocaleDateString("en-US", { 
        month: "long", 
        day: "numeric", 
        year: "numeric" 
      });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-0 backdrop-blur-xl max-w-md mx-auto p-0 overflow-visible">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-border/50 p-6">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-accent/15 via-primary/10 to-transparent rounded-full blur-3xl" />
          
          <DialogHeader className="relative z-10 mb-4">
            <DialogTitle className="text-center font-serif text-xl text-foreground">
              Share Your Kindness
            </DialogTitle>
          </DialogHeader>

          {/* Share Card Preview */}
          <div 
            ref={cardRef}
            className="relative z-10 rounded-2xl overflow-hidden mb-6"
          >
            {/* Card Background */}
            <div className="bg-gradient-to-br from-primary via-primary/90 to-accent/80 p-6">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">30 Days of Kindness</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
                  Day {dayNumber}
                </div>
              </div>
              
              {/* Card Content */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">{title}</h3>
                    <p className="text-white/80 text-sm mt-1 line-clamp-2">{description}</p>
                  </div>
                </div>
                
                {reflection && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-white/90 text-sm italic">"{reflection}"</p>
                  </div>
                )}
              </div>
              
              {/* Card Footer */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-white/70 text-xs">{formattedDate}</span>
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <Heart className="w-3 h-3 fill-current" />
                  <span>EmbraceU</span>
                </div>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="relative z-10 space-y-4">
            {/* Social Media Buttons */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleTwitterShare}
                className="w-12 h-12 rounded-full border-border/50 hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/50 hover:text-[#1DA1F2] transition-all"
              >
                <Twitter className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleFacebookShare}
                className="w-12 h-12 rounded-full border-border/50 hover:bg-[#4267B2]/10 hover:border-[#4267B2]/50 hover:text-[#4267B2] transition-all"
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLinkedInShare}
                className="w-12 h-12 rounded-full border-border/50 hover:bg-[#0077B5]/10 hover:border-[#0077B5]/50 hover:text-[#0077B5] transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyText}
                className="w-12 h-12 rounded-full border-border/50 hover:bg-accent/10 hover:border-accent/50 transition-all"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
            
            {/* Native Share Button (for mobile) */}
            {typeof navigator !== "undefined" && navigator.share && (
              <Button
                onClick={handleNativeShare}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share via...
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareKindnessCard;
