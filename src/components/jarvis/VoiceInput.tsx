import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Extend Window interface for Speech APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceInputProps {
  onVoiceInput?: (text: string) => void;
  className?: string;
}

export const VoiceInput = ({ onVoiceInput, className }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Nicht unterstützt",
        description: "Spracherkennung wird in diesem Browser nicht unterstützt.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'de-DE';

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Spracherkennung aktiviert",
        description: "Sprechen Sie jetzt mit J.A.R.V.I.S.",
      });
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);

      if (finalTranscript) {
        onVoiceInput?.(finalTranscript.trim());
        
        // Wake word detection
        const wakeWords = ['hey jarvis', 'hallo jarvis', 'jarvis'];
        const lowerTranscript = finalTranscript.toLowerCase();
        
        if (wakeWords.some(wake => lowerTranscript.includes(wake))) {
          speak("Ja, wie kann ich helfen?");
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Sprachfehler",
        description: "Es gab ein Problem mit der Spracherkennung.",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setTranscript("");
    }
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Nicht unterstützt",
        description: "Sprachausgabe wird in diesem Browser nicht unterstützt.",
        variant: "destructive"
      });
      return;
    }

    // Stop any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    // Try to find a German voice
    const voices = speechSynthesis.getVoices();
    const germanVoice = voices.find(voice => voice.lang.startsWith('de'));
    if (germanVoice) {
      utterance.voice = germanVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className={cn("jarvis-panel p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold jarvis-glow">Sprach-Interface</h3>
        <div className="flex gap-2">
          <Badge 
            variant={isListening ? "default" : "secondary"}
            className={isListening ? "bg-green-500" : ""}
          >
            {isListening ? "Aktiv" : "Bereit"}
          </Badge>
          <Badge
            variant={isSpeaking ? "default" : "secondary"} 
            className={isSpeaking ? "bg-blue-500" : ""}
          >
            {isSpeaking ? "Spricht" : "Stumm"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Button
          onClick={isListening ? stopListening : startListening}
          variant={isListening ? "destructive" : "default"}
          size="lg"
          className={cn(
            "relative",
            isListening && "animate-pulse bg-red-500 hover:bg-red-600"
          )}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          {isListening ? "Stoppen" : "Sprechen"}
        </Button>

        <Button
          onClick={isSpeaking ? stopSpeaking : () => speak("J.A.R.V.I.S. System bereit.")}
          variant="outline"
          className="border-jarvis-primary/50 hover:bg-jarvis-primary/10"
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {isSpeaking ? "Stoppen" : "Test"}
        </Button>
      </div>

      {transcript && (
        <div className="bg-background/30 border border-jarvis-primary/30 rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">Erkannt:</p>
          <p className="text-jarvis-primary">{transcript}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-muted-foreground space-y-1">
        <p>• Sagen Sie "Hey Jarvis" für Wake-Word Aktivierung</p>
        <p>• Unterstützt kontinuierliche Spracherkennung</p>
        <p>• Deutsche Sprachausgabe verfügbar</p>
      </div>
    </div>
  );
};