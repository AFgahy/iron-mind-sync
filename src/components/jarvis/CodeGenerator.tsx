import { useState } from "react";
import { Code2, Play, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CodeGeneratorProps {
  className?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export const CodeGenerator = ({ className }: CodeGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [language, setLanguage] = useState<"typescript" | "python" | "javascript">("typescript");
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    if (!prompt.trim()) {
      toast.error("Bitte beschreibe, was du programmieren möchtest");
      return;
    }

    setIsGenerating(true);
    setGeneratedCode("");

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Schreibe ${language} Code für: ${prompt}. Nur Code, keine Erklärungen.`,
            },
          ],
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Code-Generierung fehlgeschlagen");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let code = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                code += content;
                setGeneratedCode(code);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      toast.success("Code generiert!");
    } catch (error) {
      console.error("Code generation error:", error);
      toast.error("Fehler bei der Code-Generierung");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success("Code kopiert!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("jarvis-panel h-full flex flex-col", className)}>
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <Code2 className="w-5 h-5 text-jarvis-primary" />
        <span className="font-semibold jarvis-glow">Code-Generator</span>
        <Badge variant="outline" className="ml-auto border-jarvis-primary/50 text-jarvis-primary">
          AI-Powered
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          {(["typescript", "javascript", "python"] as const).map((lang) => (
            <Button
              key={lang}
              variant={language === lang ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage(lang)}
              className={language === lang ? "bg-gradient-jarvis" : ""}
            >
              {lang}
            </Button>
          ))}
        </div>

        <Textarea
          placeholder="Beschreibe, was du programmieren möchtest..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] bg-background/50 border-jarvis-primary/30"
        />

        <Button
          onClick={generateCode}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-gradient-jarvis hover:opacity-90"
        >
          <Play className="w-4 h-4 mr-2" />
          {isGenerating ? "Generiere..." : "Code Generieren"}
        </Button>
      </div>

      {generatedCode && (
        <div className="flex-1 flex flex-col border-t border-border/30">
          <div className="flex items-center justify-between p-2 border-b border-border/30">
            <span className="text-sm text-muted-foreground">Generierter Code</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyCode}
              className="h-7"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <pre className="text-sm font-mono bg-background/30 p-3 rounded-lg border border-jarvis-primary/20 overflow-x-auto">
              <code>{generatedCode}</code>
            </pre>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};