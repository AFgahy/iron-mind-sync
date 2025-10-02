import { useState } from "react";
import { Smile, Frown, Meh, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Mood = "professional" | "friendly" | "humorous" | "serious" | "enthusiastic";
type VoiceStyle = "Brian" | "Rachel" | "Eric" | "Ivy";

interface PersonalitySystemProps {
  className?: string;
  onPersonalityChange?: (personality: PersonalitySettings) => void;
}

export interface PersonalitySettings {
  mood: Mood;
  formality: number; // 0-100
  verbosity: number; // 0-100
  voiceStyle: VoiceStyle;
  responseSpeed: number; // 0-100
}

export const PersonalitySystem = ({ className, onPersonalityChange }: PersonalitySystemProps) => {
  const [personality, setPersonality] = useState<PersonalitySettings>({
    mood: "professional",
    formality: 50,
    verbosity: 50,
    voiceStyle: "Brian",
    responseSpeed: 70,
  });

  const updatePersonality = (updates: Partial<PersonalitySettings>) => {
    const newPersonality = { ...personality, ...updates };
    setPersonality(newPersonality);
    onPersonalityChange?.(newPersonality);
  };

  const moods: Array<{ value: Mood; label: string; icon: any; color: string }> = [
    { value: "professional", label: "Professionell", icon: Meh, color: "text-blue-400" },
    { value: "friendly", label: "Freundlich", icon: Smile, color: "text-green-400" },
    { value: "humorous", label: "Humorvoll", icon: Heart, color: "text-pink-400" },
    { value: "serious", label: "Ernst", icon: Frown, color: "text-gray-400" },
    { value: "enthusiastic", label: "Enthusiastisch", icon: Zap, color: "text-yellow-400" },
  ];

  return (
    <div className={cn("jarvis-panel h-full flex flex-col", className)}>
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <Heart className="w-5 h-5 text-jarvis-primary" />
        <span className="font-semibold jarvis-glow">Persönlichkeits-System</span>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Mood Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Stimmung</label>
            <Badge variant="outline" className="border-jarvis-primary/50">
              {moods.find((m) => m.value === personality.mood)?.label}
            </Badge>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {moods.map(({ value, label, icon: Icon, color }) => (
              <Button
                key={value}
                variant={personality.mood === value ? "default" : "outline"}
                size="sm"
                onClick={() => updatePersonality({ mood: value })}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-3",
                  personality.mood === value && "bg-gradient-jarvis"
                )}
              >
                <Icon className={cn("w-5 h-5", color)} />
                <span className="text-xs">{label.slice(0, 4)}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Formality */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Formalität</label>
            <Badge variant="outline" className="border-jarvis-primary/50">
              {personality.formality}%
            </Badge>
          </div>
          <Slider
            value={[personality.formality]}
            onValueChange={([value]) => updatePersonality({ formality: value })}
            max={100}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Locker</span>
            <span>Formal</span>
          </div>
        </div>

        {/* Verbosity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Ausführlichkeit</label>
            <Badge variant="outline" className="border-jarvis-primary/50">
              {personality.verbosity}%
            </Badge>
          </div>
          <Slider
            value={[personality.verbosity]}
            onValueChange={([value]) => updatePersonality({ verbosity: value })}
            max={100}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Kurz</span>
            <span>Detailliert</span>
          </div>
        </div>

        {/* Voice Style */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Stimm-Variante</label>
          <Select
            value={personality.voiceStyle}
            onValueChange={(value: VoiceStyle) => updatePersonality({ voiceStyle: value })}
          >
            <SelectTrigger className="bg-background/50 border-jarvis-primary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Brian">Brian (Standard)</SelectItem>
              <SelectItem value="Rachel">Rachel (Weiblich)</SelectItem>
              <SelectItem value="Eric">Eric (Tief)</SelectItem>
              <SelectItem value="Ivy">Ivy (Sanft)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Response Speed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Antwort-Geschwindigkeit</label>
            <Badge variant="outline" className="border-jarvis-primary/50">
              {personality.responseSpeed}%
            </Badge>
          </div>
          <Slider
            value={[personality.responseSpeed]}
            onValueChange={([value]) => updatePersonality({ responseSpeed: value })}
            max={100}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Bedacht</span>
            <span>Schnell</span>
          </div>
        </div>

        {/* Personality Preview */}
        <div className="bg-background/30 border border-jarvis-primary/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-2">Persönlichkeits-Vorschau:</p>
          <p className="text-sm text-jarvis-primary">
            {personality.mood === "professional" && "Sir, ich stehe bereit für Ihre Anweisungen."}
            {personality.mood === "friendly" && "Hey! Wie kann ich dir heute helfen?"}
            {personality.mood === "humorous" && "Na, wieder eine Weltrettungsmission?"}
            {personality.mood === "serious" && "Bereit für die nächste Aufgabe."}
            {personality.mood === "enthusiastic" && "Wow! Lass uns loslegen!"}
          </p>
        </div>
      </div>
    </div>
  );
};