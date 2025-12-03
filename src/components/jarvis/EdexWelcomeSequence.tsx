import { useState, useEffect } from 'react';

interface EdexWelcomeSequenceProps {
  userName: string;
  onComplete: () => void;
}

export const EdexWelcomeSequence = ({ userName, onComplete }: EdexWelcomeSequenceProps) => {
  const [phase, setPhase] = useState(0);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [hexagons, setHexagons] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);

  const bootSequence = [
    '> INITIALIZING eDEX-UI KERNEL...',
    '> LOADING SYSTEM MODULES...',
    '> ESTABLISHING NEURAL LINK...',
    '> MOUNTING FILE SYSTEMS...',
    '> SCANNING NETWORK INTERFACES...',
    '> LOADING USER PROFILE...',
    `> WELCOME, ${userName.toUpperCase()}`,
    '> SYSTEM READY',
  ];

  useEffect(() => {
    // Generate hexagon grid
    const newHexagons = [];
    for (let i = 0; i < 30; i++) {
      newHexagons.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      });
    }
    setHexagons(newHexagons);

    // Boot sequence
    let lineIndex = 0;
    const lineInterval = setInterval(() => {
      if (lineIndex < bootSequence.length) {
        setBootLines(prev => [...prev, bootSequence[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(lineInterval);
        setPhase(1);
      }
    }, 300);

    return () => clearInterval(lineInterval);
  }, []);

  useEffect(() => {
    if (phase === 1) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] overflow-hidden flex items-center justify-center">
      {/* Hexagon Background */}
      <div className="absolute inset-0 overflow-hidden">
        {hexagons.map(hex => (
          <div
            key={hex.id}
            className="absolute animate-pulse"
            style={{
              left: `${hex.x}%`,
              top: `${hex.y}%`,
              animationDelay: `${hex.delay}s`,
            }}
          >
            <svg width="60" height="52" viewBox="0 0 60 52" className="opacity-20">
              <polygon
                points="30,0 60,15 60,37 30,52 0,37 0,15"
                fill="none"
                stroke="hsl(175, 100%, 50%)"
                strokeWidth="1"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Scan Lines */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 200, 0.03) 2px, rgba(0, 255, 200, 0.03) 4px)',
        }}
      />

      {/* Main Terminal */}
      <div className="relative z-10 w-full max-w-2xl mx-4">
        {/* Terminal Header */}
        <div className="border border-[hsl(175,100%,50%)] border-b-0 bg-[hsl(175,100%,50%,0.1)] px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[hsl(0,70%,50%)]" />
            <div className="w-3 h-3 rounded-full bg-[hsl(45,70%,50%)]" />
            <div className="w-3 h-3 rounded-full bg-[hsl(120,70%,50%)]" />
          </div>
          <span className="text-[hsl(175,100%,50%)] text-sm font-mono ml-2">eDEX-UI :: BOOT SEQUENCE</span>
        </div>

        {/* Terminal Body */}
        <div className="border border-[hsl(175,100%,50%)] bg-[rgba(0,0,0,0.8)] p-6 min-h-[300px]">
          <div className="font-mono text-sm space-y-1">
            {bootLines.map((line, index) => (
              <div 
                key={index} 
                className="text-[hsl(175,100%,50%)] animate-fade-in"
                style={{ 
                  textShadow: '0 0 10px hsl(175, 100%, 50%)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {line}
              </div>
            ))}
            {phase === 0 && (
              <span className="inline-block w-2 h-4 bg-[hsl(175,100%,50%)] animate-pulse ml-1" />
            )}
          </div>

          {phase === 1 && (
            <div className="mt-8 text-center animate-fade-in">
              <div 
                className="text-4xl font-bold text-[hsl(175,100%,50%)]"
                style={{ textShadow: '0 0 30px hsl(175, 100%, 50%)' }}
              >
                SYSTEM ONLINE
              </div>
              <div className="text-[hsl(175,100%,70%)] mt-2 text-sm">
                All systems operational
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="border border-[hsl(175,100%,50%)] border-t-0 bg-[hsl(175,100%,50%,0.1)] px-4 py-2">
          <div className="h-2 bg-[rgba(0,255,200,0.2)] rounded overflow-hidden">
            <div 
              className="h-full bg-[hsl(175,100%,50%)] transition-all duration-300"
              style={{ 
                width: `${(bootLines.length / bootSequence.length) * 100}%`,
                boxShadow: '0 0 10px hsl(175, 100%, 50%)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-4 left-4 w-20 h-20 border-l-2 border-t-2 border-[hsl(175,100%,50%,0.5)]" />
      <div className="absolute top-4 right-4 w-20 h-20 border-r-2 border-t-2 border-[hsl(175,100%,50%,0.5)]" />
      <div className="absolute bottom-4 left-4 w-20 h-20 border-l-2 border-b-2 border-[hsl(175,100%,50%,0.5)]" />
      <div className="absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-[hsl(175,100%,50%,0.5)]" />
    </div>
  );
};
