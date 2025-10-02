import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface UseWakeWordProps {
  onWakeWordDetected: () => void;
  wakeWords?: string[];
  enabled?: boolean;
}

export const useWakeWord = ({
  onWakeWordDetected,
  wakeWords = ["jarvis", "hey jarvis", "ok jarvis"],
  enabled = false,
}: UseWakeWordProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser");
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "de-DE";

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("")
        .toLowerCase();

      console.log("🎤 Detected:", transcript);

      // Check if any wake word is detected
      for (const wakeWord of wakeWords) {
        if (transcript.includes(wakeWord.toLowerCase())) {
          console.log("✨ Wake word detected:", wakeWord);
          toast.success("J.A.R.V.I.S. aktiviert!");
          onWakeWordDetected();
          break;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Mikrofon-Zugriff verweigert");
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Restart if still enabled
      if (enabled && isListening) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [enabled, wakeWords, onWakeWordDetected]);

  useEffect(() => {
    if (!isSupported || !recognitionRef.current) return;

    if (enabled && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        console.log("🎤 Wake word detection started");
        toast.success("Wake Word Detection aktiviert");
      } catch (error) {
        console.error("Failed to start recognition:", error);
      }
    } else if (!enabled && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log("🎤 Wake word detection stopped");
    }
  }, [enabled, isSupported, isListening]);

  return {
    isListening,
    isSupported,
  };
};