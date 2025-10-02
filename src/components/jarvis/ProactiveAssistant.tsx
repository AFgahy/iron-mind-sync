import { useState, useEffect } from "react";
import { Bell, AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "alert";
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    callback: () => void;
  };
}

interface ProactiveAssistantProps {
  className?: string;
}

export const ProactiveAssistant = ({ className }: ProactiveAssistantProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Simulate proactive suggestions
    const interval = setInterval(() => {
      const suggestions = [
        {
          type: "info" as const,
          title: "Tipp des Tages",
          message: "Nutze Wake Word Detection für freihändige Steuerung",
        },
        {
          type: "warning" as const,
          title: "Systemhinweis",
          message: "Hohe CPU-Auslastung erkannt. Empfehle Prozess-Optimierung",
        },
        {
          type: "success" as const,
          title: "Update verfügbar",
          message: "Neue J.A.R.V.I.S. Features sind verfügbar",
        },
      ];

      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      
      if (Math.random() > 0.7) { // 30% chance every 30 seconds
        addNotification(randomSuggestion);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 10)); // Keep last 10
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Info className="w-4 h-4 text-blue-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className={cn("jarvis-panel h-full flex flex-col", className)}>
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <Bell className="w-5 h-5 text-jarvis-primary" />
        <span className="font-semibold jarvis-glow">Proaktive Assistenz</span>
        <Badge variant="outline" className="ml-auto border-jarvis-primary/50 text-jarvis-primary">
          {notifications.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1 p-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bell className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-sm">Keine Benachrichtigungen</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-background/50 border border-border/30 rounded-lg p-3 hover:border-jarvis-primary/30 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold">{notification.title}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 -mr-1"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {notification.timestamp.toLocaleTimeString("de-DE")}
                    </p>
                    {notification.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-7 text-xs border-jarvis-primary/30"
                        onClick={notification.action.callback}
                      >
                        {notification.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};