import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArcReactor } from "./ArcReactor";
import { ChatInterface } from "./ChatInterface";
import { VoiceInput } from "./VoiceInput";
import { SystemModules } from "./SystemModules";
import { ImageGenerator } from "./ImageGenerator";
import { ProactiveAssistant } from "./ProactiveAssistant";
import { CodeGenerator } from "./CodeGenerator";
import { Calculator } from "./Calculator";
import { PersonalitySystem } from "./PersonalitySystem";
import { PluginSystem } from "./PluginSystem";
import { LearningSystem } from "./LearningSystem";
import { UserMenu } from "./UserMenu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";
import { 
  MessageSquare, 
  Mic, 
  Settings, 
  Shield, 
  Zap,
  Monitor,
  Smartphone,
  Download,
  CheckCircle,
  Image,
  Bell,
  Code2,
  Calculator as CalcIcon,
  Heart,
  Puzzle,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePWA } from "@/hooks/usePWA";
import { toast } from "@/hooks/use-toast";

interface JarvisInterfaceProps {
  className?: string;
}

export const JarvisInterface = ({ className }: JarvisInterfaceProps) => {
  const [isSystemActive, setIsSystemActive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("chat");
  const { isInstallable, isInstalled, installPWA, browserInfo } = usePWA();
  
  const { processCommand } = useVoiceCommands({
    onOpenTab: (tabValue: string) => {
      setActiveTab(tabValue);
    }
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVoiceInput = (text: string) => {
    console.log("Voice input received:", text);
    
    // Versuche, den Text als Befehl zu verarbeiten
    const wasCommand = processCommand(text);
    
    // Wenn es kein Befehl war, zeige den Text im Chat an
    if (!wasCommand) {
      setActiveTab("chat");
      // Der Text wird vom VoiceInput direkt an ChatInterface weitergegeben
    }
  };

  const handleInstallApp = async () => {
    if (isInstalled) {
      toast({
        title: "J.A.R.V.I.S. bereits installiert",
        description: "Die App ist bereits auf diesem Gerät installiert.",
      });
      return;
    }

    if (!browserInfo.supports) {
      // Show instructions for unsupported browsers
      toast({
        title: "Browser-Alternative verwenden",
        description: `${browserInfo.name} unterstützt die App-Installation nicht. Verwenden Sie Chrome, Edge oder Firefox für die beste Erfahrung.`,
        variant: "destructive",
        duration: 5000
      });
      
      // For mobile, suggest adding to homescreen manually
      if (/android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
        setTimeout(() => {
          toast({
            title: "Alternative: Zum Startbildschirm hinzufügen",
            description: "Tippen Sie auf das Menü Ihres Browsers und wählen 'Zum Startbildschirm hinzufügen'",
            duration: 7000
          });
        }, 1000);
      }
      return;
    }

    if (!isInstallable) {
      toast({
        title: "Noch nicht bereit",
        description: "Warten Sie einen Moment und versuchen Sie es erneut.",
        variant: "destructive"
      });
      return;
    }

    const success = await installPWA();
    if (success) {
      toast({
        title: "J.A.R.V.I.S. installiert!",
        description: "Die App wurde erfolgreich auf Ihrem Gerät installiert.",
      });
    }
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

            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-11 bg-background/50 border border-border/30 overflow-x-auto text-xs">
              <TabsTrigger value="chat" className="data-[state=active]:bg-jarvis-primary/20">
                <MessageSquare className="w-4 h-4 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="voice" className="data-[state=active]:bg-jarvis-primary/20">
                <Mic className="w-4 h-4 mr-1" />
                Voice
              </TabsTrigger>
              <TabsTrigger value="image" className="data-[state=active]:bg-jarvis-primary/20">
                <Image className="w-4 h-4 mr-1" />
                Bilder
              </TabsTrigger>
              <TabsTrigger value="code" className="data-[state=active]:bg-jarvis-primary/20">
                <Code2 className="w-4 h-4 mr-1" />
                Code
              </TabsTrigger>
              <TabsTrigger value="calc" className="data-[state=active]:bg-jarvis-primary/20">
                <CalcIcon className="w-4 h-4 mr-1" />
                Calc
              </TabsTrigger>
              <TabsTrigger value="alerts" className="data-[state=active]:bg-jarvis-primary/20">
                <Bell className="w-4 h-4 mr-1" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="personality" className="data-[state=active]:bg-jarvis-primary/20">
                <Heart className="w-4 h-4 mr-1" />
                Mood
              </TabsTrigger>
              <TabsTrigger value="plugins" className="data-[state=active]:bg-jarvis-primary/20">
                <Puzzle className="w-4 h-4 mr-1" />
                Plugins
              </TabsTrigger>
              <TabsTrigger value="learning" className="data-[state=active]:bg-jarvis-primary/20">
                <Brain className="w-4 h-4 mr-1" />
                Learn
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-jarvis-primary/20">
                <Monitor className="w-4 h-4 mr-1" />
                System
              </TabsTrigger>
              <TabsTrigger value="mobile" className="data-[state=active]:bg-jarvis-primary/20">
                <Smartphone className="w-4 h-4 mr-1" />
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
                      <span className="text-muted-foreground">"Öffne Chat"</span>
                      <span className="text-jarvis-primary">Chat öffnen</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">"Öffne Rechner"</span>
                      <span className="text-jarvis-primary">Rechner öffnen</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">"Bild Generator"</span>
                      <span className="text-jarvis-primary">Bilder generieren</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">"Code Generator"</span>
                      <span className="text-jarvis-primary">Code erstellen</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">"Zeige System"</span>
                      <span className="text-jarvis-primary">System Status</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">"Öffne Plugins"</span>
                      <span className="text-jarvis-primary">Plugins anzeigen</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div className="jarvis-panel p-6">
                <h3 className="text-lg font-semibold jarvis-glow mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Bild-Generator
                </h3>
                <ImageGenerator />
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div className="h-[600px]">
                <CodeGenerator className="h-full" />
              </div>
            </TabsContent>

            <TabsContent value="calc" className="space-y-4">
              <div className="max-w-2xl mx-auto h-[600px]">
                <Calculator className="h-full" />
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <div className="max-w-3xl mx-auto h-[600px]">
                <ProactiveAssistant className="h-full" />
              </div>
            </TabsContent>

            <TabsContent value="personality" className="space-y-4">
              <div className="max-w-3xl mx-auto h-[600px]">
                <PersonalitySystem className="h-full" />
              </div>
            </TabsContent>

            <TabsContent value="plugins" className="space-y-4">
              <div className="max-w-3xl mx-auto h-[600px]">
                <PluginSystem className="h-full" />
              </div>
            </TabsContent>

            <TabsContent value="learning" className="space-y-4">
              <div className="max-w-3xl mx-auto h-[600px]">
                <LearningSystem className="h-full" />
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
                  Installieren Sie J.A.R.V.I.S. direkt auf Ihrem PC oder Handy für schnellen Zugriff
                </p>
                
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="text-left space-y-2">
                    <h4 className="font-semibold">Features:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Funktioniert offline</li>
                      <li>• Push-Benachrichtigungen</li>
                      <li>• Native App-Erfahrung</li>
                      <li>• Schneller Start vom Desktop</li>
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-jarvis" 
                    onClick={handleInstallApp}
                    disabled={isInstalled}
                  >
                    {isInstalled ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        App installiert
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        {browserInfo.supports 
                          ? (isInstallable ? 'App installieren' : 'App herunterladen')
                          : 'Installation anzeigen'
                        }
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    {browserInfo.supports 
                      ? "Funktioniert auf PC (Windows/Mac/Linux) und Mobile (Android/iOS)"
                      : `Aktueller Browser: ${browserInfo.name} - Für Installation verwenden Sie Chrome, Edge oder Firefox`
                    }
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