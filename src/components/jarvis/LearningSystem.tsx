import { useState, useEffect } from "react";
import { Brain, TrendingUp, Database, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface UserContext {
  id: string;
  context_key: string;
  context_value: any;
  category: "preference" | "behavior" | "history" | "skill";
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

interface LearningSystemProps {
  className?: string;
}

export const LearningSystem = ({ className }: LearningSystemProps) => {
  const { user } = useAuth();
  const [contexts, setContexts] = useState<UserContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadContexts = async () => {
      const { data, error } = await supabase
        .from("user_context")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error loading contexts:", error);
        return;
      }

      setContexts(
        (data || []).map((ctx) => ({
          ...ctx,
          category: ctx.category as "preference" | "behavior" | "history" | "skill",
          context_value: ctx.context_value as any,
        }))
      );
      setLoading(false);
    };

    loadContexts();

    // Simulate learning by tracking interactions
    const trackInteraction = async (type: string) => {
      const contextKey = `interaction_${type}`;
      const { data: existing } = await supabase
        .from("user_context")
        .select("*")
        .eq("context_key", contextKey)
        .maybeSingle();

      const currentValue = (existing?.context_value as any) || { count: 0 };
      const newValue = { count: (currentValue.count || 0) + 1 };

      await supabase.from("user_context").upsert({
        user_id: user.id,
        context_key: contextKey,
        context_value: newValue,
        category: "behavior",
        confidence_score: Math.min(1.0, ((currentValue.count || 0) + 1) / 100),
      });
    };

    // Track some demo interactions
    const interval = setInterval(() => {
      const types = ["chat", "voice", "code", "calc"];
      const randomType = types[Math.floor(Math.random() * types.length)];
      if (Math.random() > 0.8) {
        trackInteraction(randomType);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const getCategoryIcon = (category: UserContext["category"]) => {
    switch (category) {
      case "preference":
        return <Lightbulb className="w-4 h-4 text-yellow-400" />;
      case "behavior":
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case "history":
        return <Database className="w-4 h-4 text-purple-400" />;
      case "skill":
        return <Brain className="w-4 h-4 text-green-400" />;
    }
  };

  const getCategoryColor = (category: UserContext["category"]) => {
    switch (category) {
      case "preference":
        return "text-yellow-400 border-yellow-400/50";
      case "behavior":
        return "text-blue-400 border-blue-400/50";
      case "history":
        return "text-purple-400 border-purple-400/50";
      case "skill":
        return "text-green-400 border-green-400/50";
    }
  };

  const stats = {
    preferences: contexts.filter((c) => c.category === "preference").length,
    behaviors: contexts.filter((c) => c.category === "behavior").length,
    history: contexts.filter((c) => c.category === "history").length,
    skills: contexts.filter((c) => c.category === "skill").length,
    avgConfidence:
      contexts.length > 0
        ? contexts.reduce((sum, c) => sum + c.confidence_score, 0) / contexts.length
        : 0,
  };

  return (
    <div className={cn("jarvis-panel h-full flex flex-col", className)}>
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <Brain className="w-5 h-5 text-jarvis-primary" />
        <span className="font-semibold jarvis-glow">Selbstlernendes System</span>
        <Badge variant="outline" className="ml-auto border-jarvis-primary/50 text-jarvis-primary">
          {contexts.length} Kontexte
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        {/* Learning Progress */}
        <div className="bg-gradient-jarvis/10 border border-jarvis-primary/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Lern-Fortschritt</span>
            <span className="text-sm text-jarvis-primary">{Math.round(stats.avgConfidence * 100)}%</span>
          </div>
          <Progress value={stats.avgConfidence * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Basierend auf {contexts.length} gesammelten Interaktionen
          </p>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/30 border border-yellow-400/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-medium">Präferenzen</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.preferences}</p>
          </div>

          <div className="bg-background/30 border border-blue-400/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium">Verhalten</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.behaviors}</p>
          </div>

          <div className="bg-background/30 border border-purple-400/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium">Historie</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.history}</p>
          </div>

          <div className="bg-background/30 border border-green-400/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium">Fähigkeiten</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.skills}</p>
          </div>
        </div>
      </div>

      {/* Context List */}
      <div className="flex-1 border-t border-border/30">
        <div className="p-3 bg-background/30">
          <h4 className="text-sm font-semibold">Gelernte Kontexte</h4>
        </div>
        <ScrollArea className="flex-1 h-[300px]">
          <div className="p-3 space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Lade Daten...</p>
            ) : contexts.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm text-muted-foreground">
                  Noch keine Lern-Daten vorhanden
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Interagiere mit J.A.R.V.I.S., um Kontexte zu sammeln
                </p>
              </div>
            ) : (
              contexts.map((context) => (
                <div
                  key={context.id}
                  className="bg-background/50 border border-border/30 rounded-lg p-3 hover:border-jarvis-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(context.category)}
                      <span className="text-sm font-medium">{context.context_key}</span>
                    </div>
                    <Badge variant="outline" className={cn("text-xs", getCategoryColor(context.category))}>
                      {context.category}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Konfidenz</span>
                      <span className="text-jarvis-primary">{Math.round(context.confidence_score * 100)}%</span>
                    </div>
                    <Progress value={context.confidence_score * 100} className="h-1" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Zuletzt aktualisiert: {new Date(context.updated_at).toLocaleDateString("de-DE")}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="p-3 border-t border-border/30 text-xs text-muted-foreground space-y-1">
        <p>💡 J.A.R.V.I.S. lernt aus deinen Interaktionen</p>
        <p>🔒 Alle Daten werden sicher gespeichert</p>
        <p>🎯 Höhere Konfidenz = bessere Personalisierung</p>
      </div>
    </div>
  );
};