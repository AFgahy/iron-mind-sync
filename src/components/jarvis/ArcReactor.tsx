import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ArcReactorProps {
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ArcReactor = ({ isActive = true, size = "md", className }: ArcReactorProps) => {
  const [pulseIntensity, setPulseIntensity] = useState(0.5);

  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setPulseIntensity(Math.random() * 0.5 + 0.5);
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive]);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32"
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer Ring */}
      <div className={cn(
        "absolute rounded-full border-2 border-jarvis-primary/30",
        sizeClasses[size]
      )}>
        {/* Rotating Particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-jarvis-glow rounded-full"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${i * 30}deg) translateY(-${size === "lg" ? "64px" : size === "md" ? "48px" : "32px"})`,
              animation: `spin ${3 + i * 0.2}s linear infinite`,
              opacity: isActive ? pulseIntensity : 0.3
            }}
          />
        ))}
      </div>

      {/* Core Reactor */}
      <div 
        className={cn(
          "arc-reactor rounded-full relative overflow-hidden",
          size === "lg" ? "w-20 h-20" : size === "md" ? "w-16 h-16" : "w-12 h-12",
          !isActive && "opacity-50"
        )}
        style={{
          filter: isActive ? `brightness(${pulseIntensity + 0.5})` : "brightness(0.5)"
        }}
      >
        {/* Inner Glow */}
        <div className="absolute inset-2 rounded-full bg-jarvis-primary/20 blur-sm" />
        
        {/* Center Core */}
        <div className="absolute inset-1/3 rounded-full bg-gradient-jarvis" />
        
        {/* Energy Lines */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-full bg-gradient-to-b from-transparent via-jarvis-glow to-transparent opacity-60"
            style={{
              left: "50%",
              transform: `rotate(${i * 45}deg)`,
              transformOrigin: "center"
            }}
          />
        ))}
      </div>

      {/* Pulsing Aura */}
      {isActive && (
        <div 
          className="absolute inset-0 rounded-full bg-gradient-glow blur-xl opacity-30"
          style={{
            transform: `scale(${1 + pulseIntensity * 0.3})`,
            transition: "transform 0.5s ease-out"
          }}
        />
      )}
    </div>
  );
};