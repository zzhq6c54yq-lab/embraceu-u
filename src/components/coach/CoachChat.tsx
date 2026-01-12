import { useState, useRef, useEffect } from "react";
import { Send, Square, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/useAICoach";

interface CoachChatProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onStopGeneration: () => void;
}

const quickPromptCategories = [
  {
    label: "Emotions",
    prompts: ["I'm feeling anxious today", "I need help processing some sadness", "I'm overwhelmed right now"],
  },
  {
    label: "Habits",
    prompts: ["Help me practice gratitude", "I'm struggling with motivation", "I want to build a morning routine"],
  },
  {
    label: "Reflection",
    prompts: ["Help me reflect on my week", "I need a quick breathing exercise", "What should I focus on today?"],
  },
];

export const CoachChat = ({
  messages,
  isLoading,
  onSendMessage,
  onStopGeneration,
}: CoachChatProps) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background to-primary/5">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            {/* Warm avatar */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/20 via-rose-400/20 to-purple-400/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 via-rose-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                <span className="text-[10px] text-white">💚</span>
              </div>
            </div>
            
            {/* Warm greeting */}
            <h3 className="font-serif text-2xl text-foreground mb-2">
              Hello, friend 💫
            </h3>
            <p className="text-muted-foreground max-w-sm mb-2">
              I'm here for you, whenever you need me.
            </p>
            <p className="text-sm text-muted-foreground/70 mb-8">
              Share what's on your mind, or explore these prompts:
            </p>
            
            {/* Categorized prompts */}
            <div className="w-full max-w-md space-y-4">
              {quickPromptCategories.map((category) => (
                <div key={category.label}>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    {category.label}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {category.prompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => onSendMessage(prompt)}
                        className="px-3 py-2 text-sm rounded-full border border-border bg-card/80 hover:bg-secondary hover:border-primary/30 transition-all duration-200"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 via-rose-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card/80 backdrop-blur-sm border border-border/50 rounded-bl-sm"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                    {isLoading && index === messages.length - 1 && message.role === "assistant" && (
                      <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse rounded-full" />
                    )}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 via-rose-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-sm">
        <p className="text-xs text-muted-foreground text-center mb-2">Take your time — I'm listening 💜</p>
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind..."
            className="min-h-[44px] max-h-32 resize-none rounded-xl bg-card/80"
            disabled={isLoading}
          />
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={onStopGeneration}
              className="h-11 w-11 rounded-xl flex-shrink-0"
            >
              <Square className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className="h-11 w-11 rounded-xl flex-shrink-0 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};