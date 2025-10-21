import { useState, useEffect } from "react";
import { ArcReactor } from "./ArcReactor";
import { cn } from "@/lib/utils";

interface WelcomeSequenceProps {
  userName?: string;
  onComplete: () => void;
}

export const WelcomeSequence = ({ userName = "Sir", onComplete }: WelcomeSequenceProps) => {
  const [phase, setPhase] = useState(0);
  const [text, setText] = useState("");
  const fullText = `Welcome home, ${userName}.`;

  useEffect(() => {
    // Phase 0: Arc Reactor erscheint (2s)
    const timer1 = setTimeout(() => setPhase(1), 2000);
    
    // Phase 1: Text erscheint buchstabenweise (3s)
    if (phase === 1) {
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < fullText.length) {
          setText(fullText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setPhase(2);
        }
      }, 80);
      
      return () => clearInterval(typeInterval);
    }
    
    // Phase 2: System bereit (2s)
    if (phase === 2) {
      const timer3 = setTimeout(() => {
        setPhase(3);
        onComplete();
      }, 2000);
      return () => clearTimeout(timer3);
    }

    return () => clearTimeout(timer1);
  }, [phase, fullText, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      {/* Holographic Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 234, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 234, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }} />
      </div>

      {/* Scanning Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-jarvis-primary to-transparent opacity-50"
             style={{
               animation: 'scan 3s ease-in-out infinite',
               boxShadow: '0 0 20px rgba(0, 234, 255, 0.8)'
             }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Arc Reactor */}
        <div className={cn(
          "transition-all duration-1000",
          phase >= 0 ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}>
          <div className="relative">
            <ArcReactor size="lg" className="animate-pulse" />
            
            {/* Pulsing Rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-32 h-32 rounded-full border-2 border-jarvis-primary/30 animate-ping" 
                   style={{ animationDuration: '2s' }} />
              <div className="absolute w-40 h-40 rounded-full border-2 border-jarvis-primary/20 animate-ping" 
                   style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>

        {/* Text Display */}
        <div className={cn(
          "text-center space-y-4 transition-all duration-1000",
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          <h1 className="text-4xl md:text-6xl font-bold text-jarvis-primary jarvis-glow tracking-wider">
            {text}
            {phase === 1 && <span className="animate-pulse">|</span>}
          </h1>

          {phase >= 2 && (
            <div className="space-y-2 animate-fade-in">
              <p className="text-lg text-jarvis-primary/80">
                All systems operational
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>J.A.R.V.I.S. online</span>
              </div>
            </div>
          )}
        </div>

        {/* System Status Grid */}
        {phase >= 2 && (
          <div className="grid grid-cols-3 gap-4 mt-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {['Neural Network', 'Voice Recognition', 'AI Core'].map((system, i) => (
              <div key={i} 
                   className="bg-background/10 border border-jarvis-primary/30 rounded p-3 backdrop-blur-sm"
                   style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-jarvis-primary/70">{system}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading Bar */}
        {phase < 3 && (
          <div className="w-64 h-1 bg-background/20 rounded-full overflow-hidden mt-8">
            <div className="h-full bg-gradient-to-r from-jarvis-primary to-jarvis-accent"
                 style={{
                   width: `${((phase + 1) / 3) * 100}%`,
                   transition: 'width 0.5s ease-out',
                   boxShadow: '0 0 10px rgba(0, 234, 255, 0.8)'
                 }} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
};