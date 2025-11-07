import { useState, useEffect, useRef } from "react";
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
  const [progress, setProgress] = useState(0);
  const fullText = `Welcome home, ${userName}.`;
  const onCompleteRef = useRef(onComplete);
  
  // Update ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    if (phase === 0) {
      // Phase 0: Arc Reactor erscheint mit Scan (2.5s)
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / 2500) * 33, 33);
        setProgress(newProgress);
      }, 16);
      
      timer = setTimeout(() => {
        clearInterval(interval);
        setProgress(33);
        setPhase(1);
      }, 2500);
    } else if (phase === 1) {
      // Phase 1: Text erscheint buchstabenweise
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index <= fullText.length) {
          setText(fullText.slice(0, index));
          const textProgress = 33 + (index / fullText.length) * 34;
          setProgress(textProgress);
          index++;
        } else {
          clearInterval(typeInterval);
          setProgress(67);
          setPhase(2);
        }
      }, 80);
      
      return () => clearInterval(typeInterval);
    } else if (phase === 2) {
      // Phase 2: System bereit + Modules (2.5s)
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(67 + (elapsed / 2500) * 33, 100);
        setProgress(newProgress);
      }, 16);
      
      timer = setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        setPhase(3);
      }, 2500);
    } else if (phase === 3) {
      // Phase 3: Fade out transition (1s)
      setFadeOut(true);
      timer = setTimeout(() => {
        onCompleteRef.current();
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [phase, fullText]);

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden transition-opacity duration-1000",
      fadeOut && "opacity-0"
    )}>
      {/* Enhanced Animated Particles Background */}
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 
                ? 'rgba(0, 234, 255, 0.8)' 
                : i % 3 === 1 
                ? 'rgba(0, 162, 255, 0.6)'
                : 'rgba(255, 255, 255, 0.4)',
              animation: `particle ${3 + Math.random() * 5}s linear infinite`,
              animationDelay: `${Math.random() * 3}s`,
              boxShadow: '0 0 10px currentColor',
            }}
          />
        ))}
      </div>

      {/* Data Stream Lines */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-jarvis-primary to-transparent"
            style={{
              left: 0,
              right: 0,
              top: `${10 + i * 12}%`,
              animation: `dataStream ${4 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
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

      {/* Multi-Layer Scanning System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary Scan Line */}
        <div className="absolute w-full h-3 bg-gradient-to-r from-transparent via-jarvis-primary to-transparent opacity-80"
             style={{
               animation: 'scan 3s ease-in-out infinite',
               boxShadow: '0 0 40px rgba(0, 234, 255, 1), 0 0 80px rgba(0, 234, 255, 0.5)',
               filter: 'blur(1px)'
             }} />
        {/* Secondary Scan Line */}
        <div className="absolute w-full h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
             style={{
               animation: 'scan 4.5s ease-in-out infinite',
               animationDelay: '1.5s',
               boxShadow: '0 0 30px rgba(0, 255, 255, 0.8)',
               filter: 'blur(2px)'
             }} />
        {/* Horizontal Scan Lines */}
        <div className="absolute h-full w-3 bg-gradient-to-b from-transparent via-jarvis-primary to-transparent opacity-50"
             style={{
               animation: 'scanHorizontal 4s ease-in-out infinite',
               boxShadow: '0 0 30px rgba(0, 234, 255, 1)',
               filter: 'blur(1px)'
             }} />
        <div className="absolute h-full w-2 bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-40"
             style={{
               animation: 'scanHorizontal 5.5s ease-in-out infinite',
               animationDelay: '2s',
               boxShadow: '0 0 20px rgba(100, 200, 255, 0.8)',
               filter: 'blur(2px)'
             }} />
        {/* Diagonal Scans */}
        <div className="absolute inset-0"
             style={{
               background: 'linear-gradient(45deg, transparent 48%, rgba(0, 234, 255, 0.3) 50%, transparent 52%)',
               backgroundSize: '60px 60px',
               animation: 'diagonalScan 8s linear infinite',
             }} />
      </div>

      {/* Holographic Interference Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen">
        <div className="absolute inset-0"
             style={{
               backgroundImage: `
                 repeating-linear-gradient(0deg, rgba(0, 234, 255, 0.3) 0px, transparent 2px, transparent 4px),
                 repeating-linear-gradient(90deg, rgba(0, 234, 255, 0.2) 0px, transparent 2px, transparent 4px),
                 repeating-linear-gradient(45deg, rgba(0, 234, 255, 0.15) 0px, transparent 3px, transparent 6px)
               `,
               animation: 'interference 10s ease-in-out infinite',
             }} />
      </div>

      {/* Enhanced Corner HUD Elements */}
      <div className="absolute top-6 left-6 space-y-3 opacity-50">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 animate-fade-in"
               style={{ animationDelay: `${i * 0.2}s` }}>
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-jarvis-primary animate-pulse" 
                   style={{ animationDelay: `${i * 0.3}s`, animationDuration: '2s' }} />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-jarvis-primary/50 animate-ping" 
                   style={{ animationDelay: `${i * 0.3}s`, animationDuration: '3s' }} />
            </div>
            <div className="h-px w-20 bg-gradient-to-r from-jarvis-primary to-transparent" />
            <div className="text-[10px] text-jarvis-primary/70 font-mono">
              {['NEURAL', 'VISION', 'AUDIO', 'CORE', 'LINK'][i]}
            </div>
          </div>
        ))}
      </div>
      
      <div className="absolute top-6 right-6 space-y-3 opacity-50">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 justify-end animate-fade-in"
               style={{ animationDelay: `${i * 0.2}s` }}>
            <div className="text-[10px] text-jarvis-primary/70 font-mono text-right">
              {['READY', 'ACTIVE', 'ONLINE', 'SYNC', 'OK'][i]}
            </div>
            <div className="h-px w-20 bg-gradient-to-l from-jarvis-primary to-transparent" />
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" 
                   style={{ animationDelay: `${i * 0.3}s`, animationDuration: '2s' }} />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-400/50 animate-ping" 
                   style={{ animationDelay: `${i * 0.3}s`, animationDuration: '3s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Circular Data Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-jarvis-primary/40"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              animation: `rotate ${20 + i * 10}s linear infinite`,
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
            }}
          >
            {[...Array(8)].map((_, j) => (
              <div
                key={j}
                className="absolute w-1 h-1 bg-jarvis-primary rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${j * 45}deg) translateY(-${100 + i * 50}px)`,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Arc Reactor with Massive Enhanced Effects */}
        <div className={cn(
          "transition-all duration-1500",
          phase >= 0 ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )}>
          <div className="relative">
            {/* Multi-Layer Outer Glow */}
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-96 h-96 rounded-full bg-jarvis-primary/20 blur-[100px] animate-pulse" 
                   style={{ animationDuration: '2s' }} />
              <div className="absolute w-80 h-80 rounded-full bg-cyan-400/15 blur-[80px] animate-pulse" 
                   style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
              <div className="absolute w-64 h-64 rounded-full bg-blue-400/10 blur-[60px] animate-pulse" 
                   style={{ animationDuration: '3s', animationDelay: '1s' }} />
            </div>
            
            {/* Energy Waves */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border-2 border-jarvis-primary animate-ping"
                  style={{
                    width: `${100 + i * 30}px`,
                    height: `${100 + i * 30}px`,
                    animationDuration: `${2 + i * 0.5}s`,
                    animationDelay: `${i * 0.3}s`,
                    opacity: 0.6 - i * 0.1,
                  }}
                />
              ))}
            </div>
            
            <ArcReactor size="lg" />
            
            {/* Orbital Rings with Particles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[...Array(3)].map((_, ring) => (
                <div
                  key={ring}
                  className="absolute"
                  style={{
                    width: `${180 + ring * 60}px`,
                    height: `${180 + ring * 60}px`,
                    animation: `rotate ${15 + ring * 5}s linear infinite`,
                    animationDirection: ring % 2 === 0 ? 'normal' : 'reverse',
                  }}
                >
                  <div className="absolute inset-0 rounded-full border border-jarvis-primary/30" />
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-jarvis-primary"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${i * 30}deg) translateY(-${90 + ring * 30}px)`,
                        boxShadow: '0 0 10px rgba(0, 234, 255, 1)',
                        animation: `pulse ${1 + Math.random()}s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            
            {/* Rotating Arc Lines - More Complex */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-72 h-72" style={{ animation: 'spin 15s linear infinite' }}>
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full h-px bg-gradient-to-r from-transparent via-jarvis-primary/40 to-transparent"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${i * 22.5}deg)`,
                      opacity: i % 2 === 0 ? 1 : 0.5,
                    }}
                  />
                ))}
              </div>
              <div className="absolute w-56 h-56" style={{ animation: 'spin 20s linear infinite reverse' }}>
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Hexagonal Grid Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="absolute w-64 h-64"
                   style={{
                     backgroundImage: `
                       linear-gradient(30deg, rgba(0, 234, 255, 0.2) 12%, transparent 12.5%, transparent 87%, rgba(0, 234, 255, 0.2) 87.5%, rgba(0, 234, 255, 0.2)),
                       linear-gradient(150deg, rgba(0, 234, 255, 0.2) 12%, transparent 12.5%, transparent 87%, rgba(0, 234, 255, 0.2) 87.5%, rgba(0, 234, 255, 0.2)),
                       linear-gradient(30deg, rgba(0, 234, 255, 0.2) 12%, transparent 12.5%, transparent 87%, rgba(0, 234, 255, 0.2) 87.5%, rgba(0, 234, 255, 0.2)),
                       linear-gradient(150deg, rgba(0, 234, 255, 0.2) 12%, transparent 12.5%, transparent 87%, rgba(0, 234, 255, 0.2) 87.5%, rgba(0, 234, 255, 0.2))
                     `,
                     backgroundSize: '30px 52px',
                     backgroundPosition: '0 0, 0 0, 15px 26px, 15px 26px',
                     animation: 'pulse 4s ease-in-out infinite',
                   }} />
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

        {/* Ultra Enhanced Loading Bar */}
        {phase < 3 && (
          <div className="w-96 mt-6">
            <div className="flex justify-between text-xs text-jarvis-primary/80 mb-3 font-mono">
              <span className="tracking-wider">SYSTEM INITIALIZATION</span>
              <span className="text-jarvis-primary font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="relative">
              {/* Outer glow container */}
              <div className="absolute -inset-1 bg-jarvis-primary/20 rounded-full blur-md" />
              
              <div className="h-3 bg-black/60 rounded-full overflow-hidden border-2 border-jarvis-primary/40 relative backdrop-blur-sm">
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                     style={{ animation: 'shimmer 2s linear infinite' }} />
                
                {/* Scanline effect */}
                <div className="absolute inset-0"
                     style={{
                       backgroundImage: 'repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.03) 0px, transparent 1px, transparent 2px)',
                     }} />
                
                {/* Main progress bar with multi-layer gradient */}
                <div className="h-full relative"
                     style={{
                       width: `${progress}%`,
                       transition: 'width 0.1s linear',
                       background: 'linear-gradient(90deg, rgba(0, 234, 255, 1) 0%, rgba(0, 162, 255, 1) 50%, rgba(0, 234, 255, 1) 100%)',
                       boxShadow: '0 0 30px rgba(0, 234, 255, 1), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 0, 0, 0.5)',
                     }}>
                  {/* Highlight edge */}
                  <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/40 via-white/20 to-transparent" />
                  
                  {/* Pulsing edge */}
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white animate-pulse"
                       style={{ boxShadow: '0 0 20px rgba(255, 255, 255, 1)' }} />
                </div>

                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-30"
                     style={{
                       backgroundImage: 'repeating-linear-gradient(90deg, rgba(0, 234, 255, 0.1) 0px, transparent 2px, transparent 10px)',
                     }} />
              </div>

              {/* Progress markers */}
              <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-[10px] text-jarvis-primary/40 font-mono">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
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
          0% { top: -10%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes scanHorizontal {
          0% { left: -10%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
        @keyframes particle {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
          5% { opacity: 1; }
          50% { transform: translateY(-50vh) scale(1.2) rotate(180deg); }
          95% { opacity: 0.8; }
          100% { transform: translateY(-100vh) scale(0) rotate(360deg); opacity: 0; }
        }
        @keyframes dataStream {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes diagonalScan {
          0% { transform: translateX(-100%) translateY(-100%); }
          100% { transform: translateX(100%) translateY(100%); }
        }
        @keyframes interference {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.02); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};