import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VoiceInputProps {
  onVoiceInput?: (text: string) => void;
  className?: string;
}

const STT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speech-to-text`;

export const VoiceInput = ({ onVoiceInput, className }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            const response = await fetch(STT_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ audio: base64Audio }),
            });

            if (!response.ok) {
              throw new Error('STT failed');
            }

            const { text } = await response.json();
            setTranscript(text);
            onVoiceInput?.(text);
            toast.success("Transkription erfolgreich!");
          } catch (error) {
            console.error('STT error:', error);
            toast.error("Spracherkennung fehlgeschlagen");
          } finally {
            setIsProcessing(false);
          }
        };

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Aufnahme gestartet");
    } catch (error) {
      console.error('Mic error:', error);
      toast.error("Mikrofon-Zugriff fehlgeschlagen");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className={cn("jarvis-panel p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold jarvis-glow">Sprach-Interface</h3>
        <div className="flex gap-2">
          <Badge 
            variant={isRecording ? "default" : "secondary"}
            className={isRecording ? "bg-red-500 animate-pulse" : ""}
          >
            {isRecording ? "🎙️ Aufnahme" : "Bereit"}
          </Badge>
          {isProcessing && (
            <Badge variant="default" className="bg-blue-500 animate-pulse">
              ⚙️ Verarbeitung
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          variant={isRecording ? "destructive" : "default"}
          size="lg"
          className={cn(
            "relative w-full",
            isRecording && "animate-pulse bg-red-500 hover:bg-red-600"
          )}
        >
          {isRecording ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
          {isRecording ? "Aufnahme Stoppen" : "Aufnahme Starten"}
        </Button>
      </div>

      {transcript && (
        <div className="bg-background/30 border border-jarvis-primary/30 rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">Erkannt:</p>
          <p className="text-jarvis-primary">{transcript}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-muted-foreground space-y-1">
        <p>• Powered by OpenAI Whisper</p>
        <p>• Hochpräzise deutsche Spracherkennung</p>
        <p>• Klicke auf "Aufnahme Starten" und sprich</p>
        <p>• Klicke auf "Aufnahme Stoppen" wenn fertig</p>
      </div>
    </div>
  );
};
