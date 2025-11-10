import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Zap, Volume2, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useConversations } from "@/hooks/useConversations";
import { ConversationList } from "./ConversationList";
import { VoiceInput } from "./VoiceInput";

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
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`;

export const ChatInterface = ({ className }: ChatInterfaceProps) => {
  const {
    conversations,
    currentConversation,
    messages: dbMessages,
    loading: conversationsLoading,
    setCurrentConversation,
    createConversation,
    deleteConversation,
    addMessage,
  } = useConversations();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync DB messages with local state
  useEffect(() => {
    if (dbMessages.length > 0) {
      setMessages(
        dbMessages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          aiService: msg.ai_model || undefined,
          timestamp: new Date(msg.created_at),
        }))
      );
    } else {
      setMessages([
        {
          id: "1",
          content: "Guten Tag! Ich bin J.A.R.V.I.S. - Just A Rather Very Intelligent System. Wie kann ich Ihnen heute behilflich sein?",
          role: "assistant",
          aiService: "J.A.R.V.I.S.",
          timestamp: new Date(),
        },
      ]);
    }
  }, [dbMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
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
        aiService: "🧠 AI Router",
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

      // Save assistant message to DB
      if (assistantMessage) {
        await addMessage(assistantMessage, "assistant", "🧠 AI Router");
      }
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

    // Save user message to DB
    await addMessage(input, "user");

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

  const handleVoiceInput = async (text: string) => {
    setInput(text);
    setShowVoiceInput(false);
    // Auto-send after voice input
    setTimeout(() => {
      if (text.trim()) {
        const userMessage: Message = {
          id: Date.now().toString(),
          content: text,
          role: "user",
          timestamp: new Date()
        };
        addMessage(text, "user");
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsProcessing(true);
        streamChat(newMessages);
      }
    }, 100);
  };

  const speakMessage = async (messageId: string, text: string) => {
    if (playingAudio === messageId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
      return;
    }

    try {
      setPlayingAudio(messageId);
      
      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice: 'Brian' }),
      });

      if (!response.ok) {
        throw new Error('TTS failed');
      }

      const { audioContent } = await response.json();
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Sprachausgabe fehlgeschlagen');
      setPlayingAudio(null);
    }
  };

  return (
    <div className="h-full flex gap-4">
      {/* Conversation List Sidebar */}
      <div className="w-64 hidden md:block">
        <ConversationList
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={setCurrentConversation}
          onCreateConversation={() => createConversation()}
          onDeleteConversation={deleteConversation}
        />
      </div>

      {/* Chat Interface */}
      <div className={cn("jarvis-panel flex-1 flex flex-col h-full", className)}>
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b border-border/30 flex-shrink-0">
          <Bot className="w-5 h-5 text-jarvis-primary" />
          <span className="font-semibold jarvis-glow">J.A.R.V.I.S. Chat Interface</span>
          <Badge variant="outline" className="ml-auto border-jarvis-primary/50 text-jarvis-primary">
            🤖 Powered by AI
          </Badge>
        </div>

        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-4">
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
                  <div className="flex items-center gap-2">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.role === "assistant" && message.content && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => speakMessage(message.id, message.content)}
                      >
                        <Volume2 className={cn(
                          "w-3 h-3",
                          playingAudio === message.id && "text-jarvis-primary animate-pulse"
                        )} />
                      </Button>
                    )}
                  </div>
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
          <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}

        {showVoiceInput ? (
          <div className="p-4 border-t border-border/30 flex-shrink-0">
            <VoiceInput 
              onVoiceInput={handleVoiceInput}
              className="mb-0"
            />
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => setShowVoiceInput(false)}
            >
              Zurück zum Text-Chat
            </Button>
          </div>
        ) : (
          <div className="p-4 border-t border-border/30 flex-shrink-0">
            <div className="flex gap-2">
              <Button
                onClick={() => setShowVoiceInput(true)}
                size="icon"
                variant="outline"
                className="border-jarvis-primary/30 hover:border-jarvis-primary"
              >
                <Mic className="w-4 h-4" />
              </Button>
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
        )}
      </div>
    </div>
  );
};
