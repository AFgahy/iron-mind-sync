import { useState, useEffect } from "react";
import { ArcReactor } from "./ArcReactor";
import { ChatInterface } from "./ChatInterface";
import { VoiceInput } from "./VoiceInput";
import { SystemModules } from "./SystemModules";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Mic, 
  Settings, 
  Shield, 
  Zap,
  Monitor,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JarvisInterfaceProps {
  className?: string;
}

export const JarvisInterface = ({ className }: JarvisInterfaceProps) => {
  const [isSystemActive, setIsSystemActive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVoiceInput = (text: string) => {
    console.log("Voice input received:", text);
    // Here you would integrate with the chat interface
  };

  return (
    <div className={cn("min-h-screen bg-background relative overflow-hidden", className)}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Matrix Rain Effect */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="matrix-char absolute text-xs opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {String.fromCharCode(33 + Math.random() * 93)}
          </div>
        ))}
        
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-glow opacity-10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-glow opacity-10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 jarvis-panel mx-4 mt-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ArcReactor size="sm" isActive={isSystemActive} />
            <div>
              <h1 className="text-2xl font-bold jarvis-glow">J.A.R.V.I.S.</h1>
              <p className="text-sm text-muted-foreground">
                Just A Rather Very Intelligent System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-mono text-jarvis-primary">
                {currentTime.toLocaleTimeString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentTime.toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-400/50 text-green-400">
                <Shield className="w-3 h-3 mr-1" />
                SECURE
              </Badge>
              <Badge variant="outline" className="border-jarvis-primary/50 text-jarvis-primary">
                <Zap className="w-3 h-3 mr-1" />
                ACTIVE
              </Badge>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSystemActive(!isSystemActive)}
              className="border-jarvis-primary/50 hover:bg-jarvis-primary/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="chat" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-background/50 border border-border/30">
              <TabsTrigger value="chat" className="data-[state=active]:bg-jarvis-primary/20">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="voice" className="data-[state=active]:bg-jarvis-primary/20">
                <Mic className="w-4 h-4 mr-2" />
                Sprache
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-jarvis-primary/20">
                <Monitor className="w-4 h-4 mr-2" />
                System
              </TabsTrigger>
              <TabsTrigger value="mobile" className="data-[state=active]:bg-jarvis-primary/20">
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
                <div className="lg:col-span-2">
                  <ChatInterface className="h-full" />
                </div>
                <div className="space-y-4">
                  <div className="jarvis-panel p-4 text-center">
                    <ArcReactor size="lg" isActive={isSystemActive} className="mx-auto mb-4" />
                    <h3 className="font-semibold jarvis-glow mb-2">Arc Reactor Status</h3>
                    <p className="text-sm text-muted-foreground">
                      Energie: {isSystemActive ? "99.7%" : "Standby"}
                    </p>
                  </div>
                  <div className="jarvis-panel p-4">
                    <h3 className="font-semibold mb-2">Schnellzugriff</h3>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        KI-Router Status
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Geräte verbinden
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Einstellungen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <VoiceInput onVoiceInput={handleVoiceInput} />
                <div className="jarvis-panel p-6">
                  <h3 className="text-lg font-semibold jarvis-glow mb-4">Sprach-Kommandos</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">"Hey Jarvis"</span>
                      <span className="text-jarvis-primary">Wake Word</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">"Öffne YouTube"</span>
                      <span className="text-jarvis-primary">App starten</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">"Wie ist das Wetter?"</span>
                      <span className="text-jarvis-primary">Information</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">"Berechne 15 * 23"</span>
                      <span className="text-jarvis-primary">Mathematik</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <SystemModules />
            </TabsContent>

            <TabsContent value="mobile" className="space-y-4">
              <div className="jarvis-panel p-6 text-center">
                <Smartphone className="w-16 h-16 mx-auto mb-4 text-jarvis-primary" />
                <h3 className="text-xl font-semibold jarvis-glow mb-2">Mobile Integration</h3>
                <p className="text-muted-foreground mb-4">
                  Verbinden Sie Ihr Android-Gerät für geräteübergreifende Steuerung
                </p>
                
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="text-left space-y-2">
                    <h4 className="font-semibold">Features:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Cross-Device Commands</li>
                      <li>• Sichere Geräte-Kopplung</li>
                      <li>• Synchronisierte Daten</li>
                      <li>• Push Notifications</li>
                    </ul>
                  </div>
                  
                  <Button className="w-full bg-gradient-jarvis">
                    Android App herunterladen
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    QR-Code scannen oder direkt aus dem Play Store laden
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};