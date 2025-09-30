import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const IMAGE_GEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Bitte gib eine Bildbeschreibung ein");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(IMAGE_GEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Image generation failed');
      }

      const { image } = await response.json();
      setGeneratedImage(image);
      toast.success("Bild erfolgreich generiert!");
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error("Bildgenerierung fehlgeschlagen");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
      e.preventDefault();
      generateImage();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Beschreibe das Bild, das du erstellen möchtest..."
          className="flex-1 bg-background/50 border-jarvis-primary/30 focus:border-jarvis-primary"
          disabled={isGenerating}
        />
        <Button
          onClick={generateImage}
          disabled={!prompt.trim() || isGenerating}
          className="bg-gradient-jarvis hover:opacity-90"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generiere...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generieren
            </>
          )}
        </Button>
      </div>

      {generatedImage && (
        <Card className="p-4 bg-background/30 border-jarvis-primary/30">
          <img
            src={generatedImage}
            alt="Generated"
            className="w-full rounded-lg"
          />
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const link = document.createElement('a');
                link.href = generatedImage;
                link.download = `jarvis-image-${Date.now()}.png`;
                link.click();
              }}
              className="flex-1 border-jarvis-primary/50"
            >
              Herunterladen
            </Button>
          </div>
        </Card>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Powered by Google Gemini 2.5 Flash Image</p>
        <p>• Beschreibe dein Bild auf Deutsch oder Englisch</p>
        <p>• Je detaillierter die Beschreibung, desto besser das Ergebnis</p>
      </div>
    </div>
  );
};
