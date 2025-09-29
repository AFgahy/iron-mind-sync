import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  aiService?: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  className?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export const ChatInterface = ({ className }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Guten Tag! Ich bin J.A.R.V.I.S. - Just A Rather Very Intelligent System. Wie kann ich Ihnen heute behilflich sein?",
      role: "assistant",
      aiService: "J.A.R.V.I.S.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (chatMessages: Message[]) => {
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: chatMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          toast.error("Rate-Limit erreicht. Bitte warte einen Moment.");
        } else if (response.status === 402) {
          toast.error("Credits aufgebraucht. Bitte füge Credits hinzu.");
        }
        throw new Error("Stream konnte nicht gestartet werden");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantMessage = "";

      // Create initial assistant message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "",
        role: "assistant",
        aiService: "J.A.R.V.I.S. AI",
        timestamp: new Date()
      }]);

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
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === "assistant") {
                  lastMessage.content = assistantMessage;
                }
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsProcessing(false);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Fehler beim Abrufen der AI-Antwort");
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsProcessing(true);

    await streamChat(newMessages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("jarvis-panel h-full flex flex-col", className)}>
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <Bot className="w-5 h-5 text-jarvis-primary" />
        <span className="font-semibold jarvis-glow">J.A.R.V.I.S. Chat Interface</span>
        <Badge variant="outline" className="ml-auto border-jarvis-primary/50 text-jarvis-primary">
          🤖 Powered by AI
        </Badge>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 group",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-jarvis flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-background" />
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[70%] p-3 rounded-lg",
                  message.role === "user"
                    ? "bg-jarvis-primary/10 border border-jarvis-primary/30 text-foreground"
                    : "bg-secondary border border-border/30"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.aiService && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs border-jarvis-primary/30 text-jarvis-primary"
                    >
                      🤖 {message.aiService}
                    </Badge>
                  )}
                </div>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-jarvis flex items-center justify-center animate-pulse">
                <Zap className="w-4 h-4 text-background" />
              </div>
              <div className="bg-secondary border border-border/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-jarvis-primary rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">J.A.R.V.I.S. denkt nach...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/30">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Fragen Sie J.A.R.V.I.S. etwas..."
            className="flex-1 bg-background/50 border-jarvis-primary/30 focus:border-jarvis-primary"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            size="icon"
            className="bg-gradient-jarvis hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
