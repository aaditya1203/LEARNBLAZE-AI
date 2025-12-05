import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChatMessage,
  ChatSession,
  saveChatSession,
  getChatSession,
  queueOfflineMessage,
  getOfflineQueue,
  removeFromOfflineQueue,
} from "@/lib/chatIndexedDB";

interface ChatContext {
  topic?: string;
  subject?: string;
  difficulty?: string;
}

export const useAITutor = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [context, setContext] = useState<ChatContext>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const topicId = searchParams.get("topic") || sessionStorage.getItem("currentTopic") || "general";

  // Load context from URL params or session storage
  useEffect(() => {
    const newContext: ChatContext = {
      topic: searchParams.get("topic") || sessionStorage.getItem("currentTopic") || undefined,
      subject: searchParams.get("subject") || sessionStorage.getItem("currentSubject") || undefined,
      difficulty: searchParams.get("difficulty") || sessionStorage.getItem("currentDifficulty") || undefined,
    };
    setContext(newContext);
  }, [searchParams]);

  // Load chat history from IndexedDB
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const session = await getChatSession(topicId);
        if (session) {
          setMessages(session.messages);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };
    loadHistory();
  }, [topicId]);

  // Save chat history to IndexedDB
  const saveHistory = useCallback(async (msgs: ChatMessage[]) => {
    try {
      const session: ChatSession = {
        topicId,
        messages: msgs,
        lastUpdated: Date.now(),
        context,
      };
      await saveChatSession(session);
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [topicId, context]);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Process offline queue when back online
  useEffect(() => {
    if (isOnline) {
      processOfflineQueue();
    }
  }, [isOnline]);

  const processOfflineQueue = async () => {
    try {
      const queue = await getOfflineQueue();
      for (const item of queue) {
        await sendMessageToAI(item.message.content, undefined, item.context);
        await removeFromOfflineQueue(item.id);
      }
    } catch (error) {
      console.error("Failed to process offline queue:", error);
    }
  };

  const sendMessage = useCallback(async (
    content: string,
    fileAttachment?: { name: string; type: string; content: string }
  ) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
      fileAttachment,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    await saveHistory(newMessages);

    if (!isOnline) {
      await queueOfflineMessage({
        id: crypto.randomUUID(),
        topicId,
        message: userMessage,
        context,
        timestamp: Date.now(),
      });
      return;
    }

    await sendMessageToAI(content, fileAttachment, context, newMessages);
  }, [messages, isOnline, topicId, context, saveHistory]);

  const sendMessageToAI = async (
    content: string,
    fileAttachment?: { name: string; type: string; content: string },
    ctx?: ChatContext,
    currentMessages?: ChatMessage[]
  ) => {
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    const messagesForAPI = (currentMessages || messages).map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: messagesForAPI,
            context: ctx || context,
            fileContent: fileAttachment?.content,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = crypto.randomUUID();

      // Add empty assistant message
      setMessages(prev => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: Date.now() },
      ]);

      let textBuffer = "";

      while (true) {
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
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save final messages
      setMessages(prev => {
        const finalMessages = prev.map(m =>
          m.id === assistantId ? { ...m, content: assistantContent } : m
        );
        saveHistory(finalMessages);
        return finalMessages;
      });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("AI tutor error:", error);
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
          timestamp: Date.now(),
        };
        setMessages(prev => {
          const newMsgs = [...prev, errorMessage];
          saveHistory(newMsgs);
          return newMsgs;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearHistory = useCallback(async () => {
    setMessages([]);
    await saveHistory([]);
  }, [saveHistory]);

  return {
    messages,
    isLoading,
    isOnline,
    context,
    sendMessage,
    stopGeneration,
    clearHistory,
    setContext,
  };
};
