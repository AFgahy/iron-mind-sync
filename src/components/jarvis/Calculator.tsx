import { useState } from "react";
import { Calculator as CalcIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CalculatorProps {
  className?: string;
}

export const Calculator = ({ className }: CalculatorProps) => {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ expr: string; result: string }>>([]);

  const calculate = () => {
    try {
      // Advanced math support
      let processedExpr = expression
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/pi/g, "Math.PI")
        .replace(/e(?!\d)/g, "Math.E")
        .replace(/\^/g, "**");

      // Evaluate safely (in production, use a proper math parser)
      const calculated = eval(processedExpr);
      const resultStr = calculated.toString();

      setResult(resultStr);
      setHistory((prev) => [{ expr: expression, result: resultStr }, ...prev].slice(0, 5));
      toast.success("Berechnung erfolgreich!");
    } catch (error) {
      toast.error("Ungültiger Ausdruck");
      setResult("Fehler");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      calculate();
    }
  };

  const insertFunction = (func: string) => {
    setExpression((prev) => prev + func);
  };

  return (
    <div className={cn("jarvis-panel h-full flex flex-col", className)}>
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <CalcIcon className="w-5 h-5 text-jarvis-primary" />
        <span className="font-semibold jarvis-glow">Wissenschaftlicher Rechner</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Result Display */}
        {result !== null && (
          <div className="bg-gradient-jarvis/10 border border-jarvis-primary/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Ergebnis:</p>
            <p className="text-2xl font-bold text-jarvis-primary font-mono">{result}</p>
          </div>
        )}

        {/* Input */}
        <div className="space-y-2">
          <Input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="z.B. 2+2 oder sqrt(16) oder sin(pi/2)"
            className="bg-background/50 border-jarvis-primary/30 font-mono"
          />
          <Button
            onClick={calculate}
            className="w-full bg-gradient-jarvis hover:opacity-90"
          >
            <Zap className="w-4 h-4 mr-2" />
            Berechnen
          </Button>
        </div>

        {/* Function Shortcuts */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Funktionen:</p>
          <div className="grid grid-cols-4 gap-2">
            {["sin(", "cos(", "tan(", "sqrt(", "log(", "ln(", "pi", "e"].map((func) => (
              <Button
                key={func}
                variant="outline"
                size="sm"
                onClick={() => insertFunction(func)}
                className="text-xs border-jarvis-primary/30"
              >
                {func}
              </Button>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Verlauf:</p>
            <div className="space-y-1">
              {history.map((item, i) => (
                <div
                  key={i}
                  className="bg-background/30 border border-border/30 rounded p-2 text-xs font-mono cursor-pointer hover:border-jarvis-primary/30"
                  onClick={() => setExpression(item.expr)}
                >
                  <span className="text-muted-foreground">{item.expr}</span>
                  <span className="text-jarvis-primary"> = {item.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto p-3 border-t border-border/30 text-xs text-muted-foreground space-y-1">
        <p>Unterstützte Funktionen:</p>
        <p>• Basis: +, -, *, /, ^</p>
        <p>• Trigonometrie: sin, cos, tan</p>
        <p>• Logarithmen: log, ln</p>
        <p>• Konstanten: pi, e</p>
      </div>
    </div>
  );
};