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
  const [fadeOut, setFadeOut] = useState(false);
  const fullText = `Welcome home, ${userName}.`;

  useEffect(() => {
    // Phase 0: Arc Reactor erscheint mit Scan (2.5s)
    const timer1 = setTimeout(() => setPhase(1), 2500);
    
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
    
    // Phase 2: System bereit + Modules (2.5s)
    if (phase === 2) {
      const timer3 = setTimeout(() => {
        setPhase(3);
      }, 2500);
      return () => clearTimeout(timer3);
    }

    // Phase 3: Fade out transition (1s)
    if (phase === 3) {
      setFadeOut(true);
      const timer4 = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer4);
    }

    return () => clearTimeout(timer1);
  }, [phase, fullText, onComplete]);

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden transition-opacity duration-1000",
      fadeOut && "opacity-0"
    )}>
      {/* Animated Particles Background */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-jarvis-primary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle ${3 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Holographic Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 234, 255, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 234, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'gridMove 20s linear infinite'
        }} />
      </div>

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-jarvis-primary/5 via-transparent to-transparent" />

      {/* Scanning Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-2 bg-gradient-to-r from-transparent via-jarvis-primary to-transparent opacity-60"
             style={{
               animation: 'scan 4s ease-in-out infinite',
               boxShadow: '0 0 30px rgba(0, 234, 255, 1)',
               filter: 'blur(2px)'
             }} />
        <div className="absolute h-full w-2 bg-gradient-to-b from-transparent via-jarvis-primary to-transparent opacity-40"
             style={{
               animation: 'scanHorizontal 5s ease-in-out infinite',
               boxShadow: '0 0 30px rgba(0, 234, 255, 1)',
               filter: 'blur(2px)'
             }} />
      </div>

      {/* Corner HUD Elements */}
      <div className="absolute top-8 left-8 space-y-2 opacity-40">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-jarvis-primary animate-pulse" 
                 style={{ animationDelay: `${i * 0.3}s` }} />
            <div className="h-px w-16 bg-jarvis-primary/50" />
          </div>
        ))}
      </div>
      
      <div className="absolute top-8 right-8 space-y-2 opacity-40">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 justify-end">
            <div className="h-px w-16 bg-jarvis-primary/50" />
            <div className="w-2 h-2 rounded-full bg-jarvis-primary animate-pulse" 
                 style={{ animationDelay: `${i * 0.3}s` }} />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Arc Reactor with Enhanced Effects */}
        <div className={cn(
          "transition-all duration-1500",
          phase >= 0 ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )}>
          <div className="relative">
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-64 h-64 rounded-full bg-jarvis-primary/10 blur-3xl animate-pulse" 
                   style={{ animationDuration: '3s' }} />
            </div>
            
            <ArcReactor size="lg" />
            
            {/* Multi-Layer Pulsing Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-32 h-32 rounded-full border-2 border-jarvis-primary/40 animate-ping" 
                   style={{ animationDuration: '2s' }} />
              <div className="absolute w-40 h-40 rounded-full border-2 border-jarvis-primary/30 animate-ping" 
                   style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
              <div className="absolute w-48 h-48 rounded-full border border-jarvis-primary/20 animate-ping" 
                   style={{ animationDuration: '3s', animationDelay: '0.6s' }} />
            </div>
            
            {/* Rotating Arc Lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-56 h-56" style={{ animation: 'spin 20s linear infinite' }}>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full h-px bg-gradient-to-r from-transparent via-jarvis-primary/30 to-transparent"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Text Display with Enhanced Styling */}
        <div className={cn(
          "text-center space-y-6 transition-all duration-1000",
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-bold text-jarvis-primary tracking-wider relative"
                style={{
                  textShadow: '0 0 40px rgba(0, 234, 255, 0.8), 0 0 80px rgba(0, 234, 255, 0.4)',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.1em'
                }}>
              {text}
              {phase === 1 && (
                <span className="animate-pulse" style={{ textShadow: 'none' }}>|</span>
              )}
            </h1>
            {/* Text Underline Effect */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-jarvis-primary to-transparent opacity-50" />
          </div>

          {phase >= 2 && (
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <p className="text-xl text-jarvis-primary/90 tracking-wide font-light">
                All systems operational
              </p>
              <div className="flex items-center justify-center gap-3 text-base">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400/50 animate-ping" />
                </div>
                <span className="text-jarvis-primary/70 tracking-wide">J.A.R.V.I.S. online</span>
              </div>
            </div>
          )}
        </div>

        {/* System Status Grid with Enhanced Design */}
        {phase >= 2 && (
          <div className="grid grid-cols-3 gap-6 mt-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {['Neural Network', 'Voice Recognition', 'AI Core'].map((system, i) => (
              <div key={i} 
                   className="relative group animate-fade-in"
                   style={{ animationDelay: `${0.7 + i * 0.15}s` }}>
                <div className="absolute inset-0 bg-jarvis-primary/5 rounded-lg blur group-hover:bg-jarvis-primary/10 transition-all" />
                <div className="relative bg-black/40 border border-jarvis-primary/40 rounded-lg p-4 backdrop-blur-md">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400/50 animate-ping" 
                             style={{ animationDuration: '2s' }} />
                      </div>
                      <span className="text-xs text-jarvis-primary/90 font-medium tracking-wide">{system}</span>
                    </div>
                    <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-jarvis-primary to-green-400 rounded-full"
                           style={{ 
                             width: '100%',
                             animation: 'progressBar 2s ease-out',
                             animationDelay: `${0.7 + i * 0.15}s`,
                             animationFillMode: 'backwards'
                           }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Loading Bar */}
        {phase < 3 && (
          <div className="w-80 mt-4">
            <div className="flex justify-between text-xs text-jarvis-primary/60 mb-2">
              <span>Initializing...</span>
              <span>{Math.round(((phase + 1) / 3) * 100)}%</span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-jarvis-primary/30 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              <div className="h-full bg-gradient-to-r from-jarvis-primary via-jarvis-accent to-jarvis-primary relative"
                   style={{
                     width: `${((phase + 1) / 3) * 100}%`,
                     transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                     boxShadow: '0 0 20px rgba(0, 234, 255, 1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                   }}>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/30 to-transparent" />
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        @keyframes scan {
          0%, 100% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes scanHorizontal {
          0%, 100% { left: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
        @keyframes particle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) scale(0); opacity: 0; }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};