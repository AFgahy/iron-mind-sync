import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Battery, 
  Shield, 
  Camera, 
  Smartphone,
  Monitor,
  Calculator,
  Code,
  Image,
  Database,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleProps {
  title: string;
  icon: React.ReactNode;
  status: "online" | "offline" | "warning";
  data?: string;
  progress?: number;
  onClick?: () => void;
}

const ModuleCard = ({ title, icon, status, data, progress, onClick }: ModuleProps) => {
  const statusColors = {
    online: "text-green-400 border-green-400/30",
    offline: "text-red-400 border-red-400/30", 
    warning: "text-yellow-400 border-yellow-400/30"
  };

  return (
    <Card 
      className={cn(
        "jarvis-panel p-4 hover:border-jarvis-primary/50 transition-colors cursor-pointer",
        statusColors[status]
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        <Badge 
          variant="outline" 
          className={cn("text-xs", statusColors[status])}
        >
          {status.toUpperCase()}
        </Badge>
      </div>
      
      {data && (
        <p className="text-xs text-muted-foreground mb-2">{data}</p>
      )}
      
      {progress !== undefined && (
        <Progress value={progress} className="h-1" />
      )}
    </Card>
  );
};

interface SystemModulesProps {
  className?: string;
}

export const SystemModules = ({ className }: SystemModulesProps) => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const systemModules = [
    {
      id: "cpu",
      title: "Prozessor",
      icon: <Cpu className="w-4 h-4" />,
      status: "online" as const,
      data: "Intel Core i7 - 2.8 GHz",
      progress: 45
    },
    {
      id: "memory",
      title: "Arbeitsspeicher",
      icon: <Activity className="w-4 h-4" />,
      status: "online" as const,
      data: "16 GB DDR4",
      progress: 62
    },
    {
      id: "storage",
      title: "Speicher",
      icon: <HardDrive className="w-4 h-4" />,
      status: "warning" as const,
      data: "512 GB SSD",
      progress: 78
    },
    {
      id: "network",
      title: "Netzwerk",
      icon: <Wifi className="w-4 h-4" />,
      status: "online" as const,
      data: "WiFi 6 - 850 Mbps"
    },
    {
      id: "battery",
      title: "Batterie",
      icon: <Battery className="w-4 h-4" />,
      status: "online" as const,
      data: "94% - 4h 23min",
      progress: 94
    },
    {
      id: "security",
      title: "Sicherheit",
      icon: <Shield className="w-4 h-4" />,
      status: "online" as const,
      data: "Alle Systeme sicher"
    }
  ];

  const aiModules = [
    {
      id: "vision",
      title: "Computer Vision",
      icon: <Camera className="w-4 h-4" />,
      status: "online" as const,
      data: "Kamera-Analyse aktiv"
    },
    {
      id: "nlp",
      title: "Sprachverarbeitung",
      icon: <Code className="w-4 h-4" />,
      status: "online" as const,
      data: "Multi-Language NLP"
    },
    {
      id: "calculation",
      title: "Berechnungen",
      icon: <Calculator className="w-4 h-4" />,
      status: "online" as const,
      data: "Mathematik & Physik"
    },
    {
      id: "image_gen",
      title: "Bild-Generation",
      icon: <Image className="w-4 h-4" />,
      status: "online" as const,
      data: "DALL-E & Stable Diffusion"
    }
  ];

  const deviceModules = [
    {
      id: "mobile",
      title: "Smartphone",
      icon: <Smartphone className="w-4 h-4" />,
      status: "online" as const,
      data: "Android 14 - Verbunden"
    },
    {
      id: "desktop",
      title: "Desktop PC",
      icon: <Monitor className="w-4 h-4" />,
      status: "online" as const,
      data: "Windows 11 - Lokal"
    },
    {
      id: "database",
      title: "Datenbank",
      icon: <Database className="w-4 h-4" />,
      status: "online" as const,
      data: "Supabase - Cloud"
    },
    {
      id: "settings",
      title: "Einstellungen",
      icon: <Settings className="w-4 h-4" />,
      status: "online" as const,
      data: "Konfiguration bereit"
    }
  ];

  const handleModuleClick = (moduleId: string) => {
    setSelectedModule(moduleId === selectedModule ? null : moduleId);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* System Status */}
      <div className="jarvis-panel p-4">
        <h3 className="text-lg font-semibold jarvis-glow mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {systemModules.map((module) => (
            <ModuleCard
              key={module.id}
              {...module}
              onClick={() => handleModuleClick(module.id)}
            />
          ))}
        </div>
      </div>

      {/* KI Module */}
      <div className="jarvis-panel p-4">
        <h3 className="text-lg font-semibold jarvis-glow mb-4 flex items-center gap-2">
          <Code className="w-5 h-5" />
          KI-Module
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiModules.map((module) => (
            <ModuleCard
              key={module.id}
              {...module}
              onClick={() => handleModuleClick(module.id)}
            />
          ))}
        </div>
      </div>

      {/* Geräte & Services */}
      <div className="jarvis-panel p-4">
        <h3 className="text-lg font-semibold jarvis-glow mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Verbundene Geräte
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {deviceModules.map((module) => (
            <ModuleCard
              key={module.id}
              {...module}
              onClick={() => handleModuleClick(module.id)}
            />
          ))}
        </div>
      </div>

      {/* Module Details */}
      {selectedModule && (
        <div className="jarvis-panel p-4">
          <h3 className="text-lg font-semibold jarvis-glow mb-4">
            Modul Details: {selectedModule.toUpperCase()}
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Detaillierte Informationen und Steuerung für das ausgewählte Modul.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Konfigurieren
              </Button>
              <Button variant="outline" size="sm">
                Diagnostik
              </Button>
              <Button variant="outline" size="sm">
                Neu starten
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};