import { useCallback } from "react";
import { toast } from "sonner";

interface VoiceCommand {
  keywords: string[];
  action: () => void;
  description: string;
}

interface UseVoiceCommandsProps {
  onOpenTab?: (tabValue: string) => void;
  onExecuteAction?: (action: string, params?: any) => void;
}

export const useVoiceCommands = ({ onOpenTab, onExecuteAction }: UseVoiceCommandsProps) => {
  const processCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase().trim();
    
    // Tab-Öffnungs-Befehle
    const tabCommands: Record<string, string[]> = {
      chat: ["öffne chat", "zeige chat", "chat öffnen", "zum chat"],
      voice: ["öffne sprache", "zeige sprache", "spracheingabe", "sprachsteuerung"],
      image: ["öffne bilder", "bild generator", "bilder generieren", "erstelle bild", "zeige bilder"],
      code: ["öffne code", "code generator", "programmieren", "zeige code"],
      calc: ["öffne rechner", "taschenrechner", "calculator", "rechnen", "berechne"],
      security: ["öffne security", "sicherheit", "security", "zeige security", "öffne sicherheit"],
      alerts: ["öffne benachrichtigungen", "zeige alerts", "benachrichtigungen", "alerts"],
      personality: ["öffne persönlichkeit", "zeige stimmung", "mood", "persönlichkeit"],
      plugins: ["öffne plugins", "zeige plugins", "erweiterungen"],
      learning: ["öffne lernen", "lernmodus", "learning", "zeige lernen"],
      system: ["öffne system", "system status", "zeige system"],
      mobile: ["öffne mobile", "app installation", "installieren"]
    };

    // Prüfe Tab-Befehle
    for (const [tab, keywords] of Object.entries(tabCommands)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        onOpenTab?.(tab);
        toast.success(`${getTabName(tab)} wird geöffnet`);
        return true;
      }
    }

    // Spezielle Aktionen
    if (lowerText.includes("berechne") || lowerText.includes("rechne")) {
      onOpenTab?.("calc");
      toast.success("Rechner wird geöffnet");
      return true;
    }

    if (lowerText.includes("erstelle") && (lowerText.includes("bild") || lowerText.includes("image"))) {
      onOpenTab?.("image");
      toast.success("Bild-Generator wird geöffnet");
      return true;
    }

    if (lowerText.includes("programmier") || lowerText.includes("code schreiben")) {
      onOpenTab?.("code");
      toast.success("Code-Generator wird geöffnet");
      return true;
    }

    // Wenn kein Befehl erkannt wurde
    return false;
  }, [onOpenTab, onExecuteAction]);

  return { processCommand };
};

const getTabName = (tab: string): string => {
  const names: Record<string, string> = {
    chat: "Chat",
    voice: "Spracheingabe",
    image: "Bild-Generator",
    code: "Code-Generator",
    calc: "Rechner",
    security: "Security System",
    alerts: "Benachrichtigungen",
    personality: "Persönlichkeit",
    plugins: "Plugins",
    learning: "Lernmodus",
    system: "System",
    mobile: "Mobile App"
  };
  return names[tab] || tab;
};
