import { useState } from "react";
import { Puzzle, Plus, Trash2, Power, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  type: "ai-model" | "api-integration" | "hardware" | "utility";
  icon?: string;
}

interface PluginSystemProps {
  className?: string;
}

export const PluginSystem = ({ className }: PluginSystemProps) => {
  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: "1",
      name: "OpenAI GPT-5",
      description: "Integriere OpenAI GPT-5 als zusätzliches AI-Modell",
      version: "1.0.0",
      enabled: true,
      type: "ai-model",
      icon: "🤖",
    },
    {
      id: "2",
      name: "Claude Sonnet",
      description: "Anthropic's Claude AI für komplexe Reasoning-Tasks",
      version: "1.0.0",
      enabled: true,
      type: "ai-model",
      icon: "🧠",
    },
    {
      id: "3",
      name: "Weather API",
      description: "Wetterdaten und Vorhersagen in Echtzeit",
      version: "1.0.0",
      enabled: false,
      type: "api-integration",
      icon: "☁️",
    },
    {
      id: "4",
      name: "Smart Home Hub",
      description: "Steuerung von Smart Home Geräten (Philips Hue, etc.)",
      version: "0.9.0",
      enabled: false,
      type: "hardware",
      icon: "💡",
    },
    {
      id: "5",
      name: "Email Automation",
      description: "Automatisierte E-Mail-Verwaltung und Benachrichtigungen",
      version: "1.0.0",
      enabled: false,
      type: "api-integration",
      icon: "📧",
    },
  ]);

  const [showAddPlugin, setShowAddPlugin] = useState(false);
  const [newPluginUrl, setNewPluginUrl] = useState("");

  const togglePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, enabled: !p.enabled }
          : p
      )
    );

    const plugin = plugins.find((p) => p.id === id);
    if (plugin) {
      toast.success(
        plugin.enabled
          ? `${plugin.name} deaktiviert`
          : `${plugin.name} aktiviert`
      );
    }
  };

  const removePlugin = (id: string) => {
    const plugin = plugins.find((p) => p.id === id);
    setPlugins((prev) => prev.filter((p) => p.id !== id));
    toast.success(`${plugin?.name} entfernt`);
  };

  const installPlugin = () => {
    if (!newPluginUrl.trim()) {
      toast.error("Bitte Plugin-URL eingeben");
      return;
    }

    toast.success("Plugin-Installation gestartet...");
    // In real implementation, this would fetch and validate the plugin
    setNewPluginUrl("");
    setShowAddPlugin(false);
  };

  const getTypeColor = (type: Plugin["type"]) => {
    switch (type) {
      case "ai-model":
        return "text-blue-400 border-blue-400/50";
      case "api-integration":
        return "text-green-400 border-green-400/50";
      case "hardware":
        return "text-purple-400 border-purple-400/50";
      case "utility":
        return "text-yellow-400 border-yellow-400/50";
    }
  };

  const getTypeLabel = (type: Plugin["type"]) => {
    switch (type) {
      case "ai-model":
        return "AI Model";
      case "api-integration":
        return "API";
      case "hardware":
        return "Hardware";
      case "utility":
        return "Utility";
    }
  };

  return (
    <div className={cn("jarvis-panel h-full flex flex-col", className)}>
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <Puzzle className="w-5 h-5 text-jarvis-primary" />
        <span className="font-semibold jarvis-glow">Plugin-System</span>
        <Badge variant="outline" className="ml-auto border-jarvis-primary/50 text-jarvis-primary">
          {plugins.filter((p) => p.enabled).length} / {plugins.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3 mb-4">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className={cn(
                "bg-background/50 border rounded-lg p-4 transition-all",
                plugin.enabled
                  ? "border-jarvis-primary/30"
                  : "border-border/30 opacity-60"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{plugin.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-semibold">{plugin.name}</h4>
                      <p className="text-xs text-muted-foreground">v{plugin.version}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={plugin.enabled}
                        onCheckedChange={() => togglePlugin(plugin.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removePlugin(plugin.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {plugin.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getTypeColor(plugin.type))}
                    >
                      {getTypeLabel(plugin.type)}
                    </Badge>
                    {plugin.enabled && (
                      <Badge
                        variant="outline"
                        className="text-xs border-green-400/50 text-green-400"
                      >
                        <Power className="w-3 h-3 mr-1" />
                        Aktiv
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showAddPlugin && (
          <div className="bg-background/50 border border-jarvis-primary/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-3">Plugin installieren</h4>
            <div className="space-y-3">
              <Input
                placeholder="Plugin-URL oder NPM-Paket..."
                value={newPluginUrl}
                onChange={(e) => setNewPluginUrl(e.target.value)}
                className="bg-background/50 border-jarvis-primary/30"
              />
              <div className="flex gap-2">
                <Button
                  onClick={installPlugin}
                  className="flex-1 bg-gradient-jarvis"
                  size="sm"
                >
                  Installieren
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddPlugin(false)}
                  size="sm"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-border/30 space-y-2">
        <Button
          onClick={() => setShowAddPlugin(!showAddPlugin)}
          variant="outline"
          className="w-full border-jarvis-primary/30"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Neues Plugin hinzufügen
        </Button>
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Plugins erweitern J.A.R.V.I.S. mit neuen Funktionen</p>
          <p>Unterstützt: AI-Modelle, APIs, Hardware, Utilities</p>
        </div>
      </div>
    </div>
  );
};