import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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

const AI_SERVICES = [
  { name: "OpenAI GPT", color: "bg-green-500", icon: "🧠" },
  { name: "Claude", color: "bg-purple-500", icon: "🤖" },
  { name: "Gemini", color: "bg-blue-500", icon: "💎" },
  { name: "Local AI", color: "bg-orange-500", icon: "⚡" }
];

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

  const selectBestAI = (message: string): typeof AI_SERVICES[0] => {
    // Simple AI router logic - in real implementation this would be more sophisticated
    if (message.toLowerCase().includes("bild") || message.toLowerCase().includes("image")) {
      return AI_SERVICES[2]; // Gemini for images
    }
    if (message.toLowerCase().includes("code") || message.toLowerCase().includes("programmierung")) {
      return AI_SERVICES[0]; // GPT for coding
    }
    if (message.toLowerCase().includes("analyse") || message.toLowerCase().includes("denken")) {
      return AI_SERVICES[1]; // Claude for analysis
    }
    return AI_SERVICES[Math.floor(Math.random() * AI_SERVICES.length)];
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Simulate AI processing with router selection
    const selectedAI = selectBestAI(input);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const responses = [
      "Verstanden. Ich analysiere Ihre Anfrage und stelle die optimale Lösung bereit.",
      "Basierend auf meinen Berechnungen empfehle ich folgendes Vorgehen...",
      "Ich habe die verfügbaren Daten durchsucht und folgende Informationen gefunden:",
      "Ihre Anfrage wurde an das entsprechende Subsystem weitergeleitet.",
      "Analysiere... Verarbeitung abgeschlossen. Hier sind die Ergebnisse:"
    ];

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: responses[Math.floor(Math.random() * responses.length)],
      role: "assistant",
      aiService: selectedAI.name,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsProcessing(false);
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
          Multi-AI Router
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
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.aiService && (
                    <Badge variant="secondary" className="text-xs">
                      {message.aiService}
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
                  <span className="text-sm text-muted-foreground">J.A.R.V.I.S. verarbeitet...</span>
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