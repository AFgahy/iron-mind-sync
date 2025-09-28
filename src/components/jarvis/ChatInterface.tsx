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
  { name: "OpenAI GPT-4", color: "bg-green-500", icon: "🧠", specialty: "Programmierung, Logik, Mathematik" },
  { name: "Claude Sonnet", color: "bg-purple-500", icon: "🤖", specialty: "Analyse, Schreiben, Verstehen" },
  { name: "Gemini Pro", color: "bg-blue-500", icon: "💎", specialty: "Multimodal, Bilder, Kreativität" },
  { name: "J.A.R.V.I.S. System", color: "bg-orange-500", icon: "⚡", specialty: "Systemsteuerung, Automation" }
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
    const lowerMsg = message.toLowerCase();
    
    // System commands
    if (lowerMsg.includes("öffne") || lowerMsg.includes("starte") || lowerMsg.includes("ausführen") || 
        lowerMsg.includes("system") || lowerMsg.includes("computer")) {
      return AI_SERVICES[3]; // J.A.R.V.I.S. System
    }
    
    // Programming and technical
    if (lowerMsg.includes("code") || lowerMsg.includes("programmier") || lowerMsg.includes("debug") ||
        lowerMsg.includes("algorithmus") || lowerMsg.includes("berechne") || lowerMsg.includes("mathematik")) {
      return AI_SERVICES[0]; // GPT-4
    }
    
    // Images and creativity  
    if (lowerMsg.includes("bild") || lowerMsg.includes("image") || lowerMsg.includes("design") ||
        lowerMsg.includes("kreativ") || lowerMsg.includes("farbe") || lowerMsg.includes("visuell")) {
      return AI_SERVICES[2]; // Gemini
    }
    
    // Analysis and writing
    if (lowerMsg.includes("analyse") || lowerMsg.includes("schreib") || lowerMsg.includes("erkläre") ||
        lowerMsg.includes("zusammenfass") || lowerMsg.includes("verstehe") || lowerMsg.includes("denke")) {
      return AI_SERVICES[1]; // Claude
    }
    
    // Default to Claude for general questions
    return AI_SERVICES[1];
  };

  const generateResponse = (userInput: string, selectedAI: typeof AI_SERVICES[0]): string => {
    const lowerInput = userInput.toLowerCase();
    
    // System commands
    if (lowerInput.includes("öffne youtube")) {
      return "🎥 YouTube wird geöffnet... (Funktioniert nur in der installierten App, nicht im Browser-Preview)";
    }
    if (lowerInput.includes("öffne") || lowerInput.includes("starte")) {
      const app = userInput.match(/öffne\s+(\w+)/i)?.[1] || "die Anwendung";
      return `🚀 Versuche ${app} zu öffnen... (Systemsteuerung funktioniert nur in der installierten Desktop-App)`;
    }
    
    // Programming questions
    if (lowerInput.includes("code") || lowerInput.includes("programmier")) {
      return `💻 ${selectedAI.name} analysiert Ihre Programmieranfrage. Ich kann Ihnen mit Code-Erstellung, Debugging und technischen Lösungen helfen. Was genau möchten Sie programmieren?`;
    }
    
    // Math calculations
    if (lowerInput.includes("berechne") || lowerInput.includes("rechne")) {
      const mathMatch = userInput.match(/\d+[\+\-\*\/]\d+/);
      if (mathMatch) {
        try {
          const result = eval(mathMatch[0]);
          return `🔢 ${selectedAI.name}: ${mathMatch[0]} = ${result}`;
        } catch {
          return `🔢 ${selectedAI.name}: Mathematische Berechnung wird verarbeitet...`;
        }
      }
      return `🔢 ${selectedAI.name}: Welche Berechnung soll ich durchführen?`;
    }
    
    // Weather questions
    if (lowerInput.includes("wetter")) {
      return `🌤️ ${selectedAI.name}: Das Wetter wird analysiert... (Für echte Wetterdaten benötige ich eine API-Verbindung)`;
    }
    
    // Time questions
    if (lowerInput.includes("uhrzeit") || lowerInput.includes("zeit")) {
      return `⏰ ${selectedAI.name}: Es ist ${new Date().toLocaleTimeString()}`;
    }
    
    // Image/design questions
    if (lowerInput.includes("bild") || lowerInput.includes("design")) {
      return `🎨 ${selectedAI.name}: Bildanalyse und Design-Unterstützung werden verarbeitet. Was für ein visuelles Projekt haben Sie im Sinn?`;
    }
    
    // General conversation
    const responses = [
      `${selectedAI.name}: Ihre Anfrage wird analysiert. Basierend auf meiner Spezialisierung in ${selectedAI.specialty} kann ich Ihnen dabei helfen.`,
      `${selectedAI.name}: Verstanden. Ich nutze meine Expertise in ${selectedAI.specialty} für Ihre Anfrage.`,
      `${selectedAI.name}: Analysiere Ihre Nachricht... Als Spezialist für ${selectedAI.specialty} finde ich die beste Lösung.`,
      `${selectedAI.name}: Ihre Anfrage wurde empfangen. Mit meinen Fähigkeiten in ${selectedAI.specialty} arbeite ich an der Antwort.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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
    const userInput = input;
    setInput("");
    setIsProcessing(true);

    // Select best AI for the task
    const selectedAI = selectBestAI(userInput);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));

    // Generate contextual response
    const response = generateResponse(userInput, selectedAI);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response,
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
                  <span className="text-sm text-muted-foreground">KI-Router wählt optimale AI aus...</span>
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