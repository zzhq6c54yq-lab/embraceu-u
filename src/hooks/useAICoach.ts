import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export const useAICoach = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("ai_coach_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching conversations:", error);
      return;
    }

    const parsed = data?.map((c) => ({
      ...c,
      messages: (Array.isArray(c.messages) ? c.messages : []) as unknown as Message[],
    })) || [];

    setConversations(parsed);
  }, [user]);

  const loadConversation = useCallback((conversation: Conversation) => {
    setCurrentConversationId(conversation.id);
    setMessages(conversation.messages);
  }, []);

  const startNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  const saveConversation = useCallback(async (newMessages: Message[]) => {
    if (!user || newMessages.length === 0) return;

    const title = newMessages[0]?.content.slice(0, 50) + (newMessages[0]?.content.length > 50 ? "..." : "");
    const messagesJson = JSON.parse(JSON.stringify(newMessages));

    if (currentConversationId) {
      await supabase
        .from("ai_coach_conversations")
        .update({
          messages: messagesJson,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentConversationId);
    } else {
      const { data, error } = await supabase
        .from("ai_coach_conversations")
        .insert([{
          user_id: user.id,
          title,
          messages: messagesJson,
        }])
        .select()
        .single();

      if (!error && data) {
        setCurrentConversationId(data.id);
      }
    }

    fetchConversations();
  }, [user, currentConversationId, fetchConversations]);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: newMessages,
            conversationId: currentConversationId,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      let streamDone = false;

      const updateAssistant = (content: string) => {
        assistantContent = content;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
          }
          return [...prev, { role: "assistant", content }];
        });
      };

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              updateAssistant(assistantContent + delta);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save after complete
      const finalMessages = [...newMessages, { role: "assistant" as const, content: assistantContent }];
      setMessages(finalMessages);
      await saveConversation(finalMessages);

    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      console.error("AI Coach error:", error);
      toast.error((error as Error).message || "Failed to get response from coach");
      setMessages(newMessages); // Revert to before assistant message
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, currentConversationId, saveConversation]);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    if (!user) return;

    await supabase.from("ai_coach_conversations").delete().eq("id", id);

    if (currentConversationId === id) {
      startNewConversation();
    }

    fetchConversations();
  }, [user, currentConversationId, startNewConversation, fetchConversations]);

  return {
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
  };
};