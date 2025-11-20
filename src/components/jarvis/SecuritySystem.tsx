import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Unlock, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { useWakeWord } from "@/hooks/useWakeWord";

interface SecuritySystemProps {
  className?: string;
}

export const SecuritySystem = ({ className = "" }: SecuritySystemProps) => {
  const [isLocked, setIsLocked] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(false);
  const [userVoiceProfile, setUserVoiceProfile] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Voice commands für Security
  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes("sperren") || lowerCommand.includes("lock")) {
      lockApp();
    } else if (lowerCommand.includes("entsperren") || lowerCommand.includes("unlock")) {
      unlockApp();
    } else if (lowerCommand.includes("alarm") || lowerCommand.includes("finde mein handy")) {
      toggleAlarm();
    } else if (lowerCommand.includes("stopp alarm") || lowerCommand.includes("stop alarm")) {
      stopAlarm();
    }
  };

  const { isListening } = useWakeWord({
    onWakeWordDetected: () => {
      // Wake word wurde erkannt, bereit für Befehle
    },
    wakeWords: ["jarvis", "hey jarvis", "ok jarvis", "security"],
    enabled: voiceControlEnabled && !isLocked,
  });

  // Alarm Sound Generator
  const playAlarmSound = () => {
    try {
      audioContextRef.current = new AudioContext();
      oscillatorRef.current = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillatorRef.current.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Schrill alarm sound
      oscillatorRef.current.type = "square";
      oscillatorRef.current.frequency.value = 1000;
      
      // Pulsierender Effekt
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      
      const pulseInterval = setInterval(() => {
        if (oscillatorRef.current && audioContextRef.current) {
          oscillatorRef.current.frequency.value = 
            oscillatorRef.current.frequency.value === 1000 ? 1500 : 1000;
        }
      }, 300);
      
      oscillatorRef.current.start();
      
      // Auto-stop nach 30 Sekunden
      setTimeout(() => {
        stopAlarm();
        clearInterval(pulseInterval);
      }, 30000);
    } catch (error) {
      console.error("Fehler beim Abspielen des Alarms:", error);
      toast.error("Alarm konnte nicht gestartet werden");
    }
  };

  const stopAlarm = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAlarmActive(false);
    toast.success("Alarm gestoppt");
  };

  const toggleAlarm = () => {
    if (alarmActive) {
      stopAlarm();
    } else {
      setAlarmActive(true);
      playAlarmSound();
      toast.error("🚨 ALARM AKTIVIERT!", {
        description: "Lauter Alarm-Ton wird abgespielt",
        duration: 5000,
      });
    }
  };

  const lockApp = () => {
    setIsLocked(true);
    toast.error("🔒 App gesperrt", {
      description: "App ist jetzt gesperrt. Entsperren per Sprachbefehl oder Button.",
      duration: 3000,
    });
  };

  const unlockApp = () => {
    setIsLocked(false);
    toast.success("🔓 App entsperrt");
  };

  const setupVoiceProfile = async () => {
    toast.info("Voice Profile Setup", {
      description: "Diese Funktion würde normalerweise einen Voice Biometrie Service benötigen",
      duration: 5000,
    });
    setUserVoiceProfile("demo-profile-" + Date.now());
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Locked Screen Overlay
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4 bg-destructive/10 border-destructive">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Lock className="h-24 w-24 text-destructive animate-pulse" />
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-destructive mb-2">
                App Gesperrt
              </h2>
              <p className="text-muted-foreground">
                {voiceControlEnabled 
                  ? 'Sage "Entsperren" oder klicke auf den Button'
                  : 'Klicke auf den Button zum Entsperren'}
              </p>
            </div>

            {voiceControlEnabled && (
              <Badge variant="outline" className="border-destructive text-destructive">
                <Mic className="h-3 w-3 mr-1" />
                Sprachsteuerung aktiv
              </Badge>
            )}

            <Button 
              onClick={unlockApp}
              className="w-full bg-destructive hover:bg-destructive/90"
              size="lg"
            >
              <Unlock className="mr-2 h-5 w-5" />
              Entsperren
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Security System</h2>
        </div>
        <Badge variant={voiceControlEnabled ? "default" : "secondary"}>
          {isListening ? (
            <>
              <Mic className="h-3 w-3 mr-1 animate-pulse" />
              Hört zu
            </>
          ) : voiceControlEnabled ? (
            <>
              <Mic className="h-3 w-3 mr-1" />
              Bereit
            </>
          ) : (
            <>
              <MicOff className="h-3 w-3 mr-1" />
              Inaktiv
            </>
          )}
        </Badge>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          ⚠️ <strong>Wichtig:</strong> Web-Apps können nur die App selbst sperren, 
          nicht das gesamte Handy. Für systemweite Kontrolle wäre eine native App nötig.
        </p>
      </Card>

      {/* Voice Control */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Sprachsteuerung</h3>
              <p className="text-sm text-muted-foreground">
                Steuere die App mit deiner Stimme
              </p>
            </div>
            <Button
              variant={voiceControlEnabled ? "default" : "outline"}
              onClick={() => setVoiceControlEnabled(!voiceControlEnabled)}
            >
              {voiceControlEnabled ? (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Aktiv
                </>
              ) : (
                <>
                  <MicOff className="mr-2 h-4 w-4" />
                  Inaktiv
                </>
              )}
            </Button>
          </div>

          {voiceControlEnabled && (
            <div className="space-y-2 text-sm">
              <p className="font-medium">Verfügbare Sprachbefehle:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>"Jarvis, sperren" - App sperren</li>
                <li>"Jarvis, entsperren" - App entsperren</li>
                <li>"Jarvis, alarm" - Alarm aktivieren</li>
                <li>"Jarvis, stopp alarm" - Alarm deaktivieren</li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Security Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lock App */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <Lock className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">App Sperren</h3>
                <p className="text-xs text-muted-foreground">
                  Sperre die App sofort
                </p>
              </div>
            </div>
            <Button 
              onClick={lockApp}
              className="w-full bg-destructive hover:bg-destructive/90"
            >
              <Lock className="mr-2 h-4 w-4" />
              Jetzt Sperren
            </Button>
          </div>
        </Card>

        {/* Alarm */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${alarmActive ? 'bg-destructive animate-pulse' : 'bg-primary/10'}`}>
                {alarmActive ? (
                  <Volume2 className="h-6 w-6 text-destructive-foreground" />
                ) : (
                  <VolumeX className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">Alarm</h3>
                <p className="text-xs text-muted-foreground">
                  Laut für Diebstahlschutz
                </p>
              </div>
            </div>
            <Button 
              onClick={toggleAlarm}
              variant={alarmActive ? "destructive" : "default"}
              className="w-full"
            >
              {alarmActive ? (
                <>
                  <VolumeX className="mr-2 h-4 w-4" />
                  Alarm Stoppen
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Alarm Aktivieren
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Voice Profile */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Stimm-Profil</h3>
            <p className="text-sm text-muted-foreground">
              Für erweiterte Stimmerkennung (würde Voice Biometrie Service benötigen)
            </p>
          </div>
          
          {userVoiceProfile ? (
            <Badge variant="outline" className="border-primary">
              <Mic className="h-3 w-3 mr-1" />
              Profil erstellt
            </Badge>
          ) : (
            <Button 
              onClick={setupVoiceProfile}
              variant="outline"
            >
              <Mic className="mr-2 h-4 w-4" />
              Stimm-Profil Erstellen
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
