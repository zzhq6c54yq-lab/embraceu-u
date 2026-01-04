import { useEffect, useState } from "react";
import { Menu, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CoachChat, CoachSidebar } from "@/components/coach";
import { useAICoach } from "@/hooks/useAICoach";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import AppLayout from "@/components/AppLayout";
import UpgradeModal from "@/components/UpgradeModal";
import { SEOHead } from "@/components/SEOHead";
import ProBadge from "@/components/ProBadge";

const Coach = () => {
  const { user } = useAuth();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const {
    messages,
    isLoading,
    conversations,
    currentConversationId,
    sendMessage,
    stopGeneration,
    fetchConversations,
    loadConversation,
    startNewConversation,
    deleteConversation,
  } = useAICoach();

  useEffect(() => {
    if (user && isPremium) {
      fetchConversations();
    }
  }, [user, isPremium, fetchConversations]);

  const handleLoadConversation = (conversation: typeof conversations[0]) => {
    loadConversation(conversation);
    setSidebarOpen(false);
  };

  // Non-premium gate
  if (!premiumLoading && !isPremium) {
    return (
      <AppLayout>
        <SEOHead
          title="AI Wellness Coach | EmbraceU Pro"
          description="Your personal AI wellness coach for guided support on your self-improvement journey."
        />
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pro-gold/20 to-pro-gold/5 flex items-center justify-center mb-6 animate-pro-glow-subtle">
            <Sparkles className="w-10 h-10 text-pro-gold" />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <h1 className="font-serif text-3xl text-foreground">
              AI Wellness Coach
            </h1>
            <ProBadge />
          </div>
          <p className="text-muted-foreground max-w-md mb-8">
            Get personalized guidance, process emotions, and build mindfulness
            habits with your AI-powered wellness companion.
          </p>
          <Button
            onClick={() => setShowUpgrade(true)}
            className="btn-premium"
          >
            <Crown className="w-4 h-4 mr-2" />
            Unlock Pro
          </Button>
        </div>
        <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
      </AppLayout>
    );
  }

  const sidebarContent = (
    <CoachSidebar
      conversations={conversations}
      currentConversationId={currentConversationId}
      onNewConversation={() => {
        startNewConversation();
        setSidebarOpen(false);
      }}
      onLoadConversation={handleLoadConversation}
      onDeleteConversation={deleteConversation}
    />
  );

  return (
    <AppLayout showNav={false}>
      <SEOHead
        title="AI Wellness Coach | EmbraceU"
        description="Chat with your personal AI wellness coach for guidance on mindfulness, gratitude, and emotional well-being."
      />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-64 flex-shrink-0">{sidebarContent}</div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  {sidebarContent}
                </SheetContent>
              </Sheet>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-lg text-foreground leading-tight">
                  Wellness Coach
                </h1>
                <p className="text-xs text-muted-foreground">
                  {currentConversationId ? "Continuing chat" : "New conversation"}
                </p>
              </div>
            </div>
          </header>

          {/* Chat */}
          <CoachChat
            messages={messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            onStopGeneration={stopGeneration}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Coach;