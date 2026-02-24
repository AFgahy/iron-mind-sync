import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  MapPin,
  Upload,
  Camera,
  Loader2,
  Globe,
  Navigation,
  Eye,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationResult {
  found: boolean;
  confidence: "high" | "medium" | "low";
  latitude: number;
  longitude: number;
  location_name: string;
  country: string;
  city: string;
  street: string;
  house_number: string;
  description: string;
  clues: string[];
  nearby_landmarks: string[];
}

interface GeoLocatorProps {
  className?: string;
}

export const GeoLocator = ({ className }: GeoLocatorProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<LocationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Fehler", description: "Bitte wähle eine Bilddatei aus.", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Fehler", description: "Maximale Dateigröße: 10MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("geolocate-image", {
        body: { imageBase64: imagePreview },
      });

      if (error) throw error;

      setResult(data as LocationResult);

      if (data.found) {
        toast({ title: "Standort gefunden!", description: `${data.location_name}, ${data.country}` });
      } else {
        toast({ title: "Kein Standort erkannt", description: "Versuche ein anderes Bild mit mehr visuellen Hinweisen.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Geolocation error:", err);
      toast({ title: "Analysefehler", description: "Das Bild konnte nicht analysiert werden.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openInMaps = () => {
    if (!result?.found) return;
    window.open(`https://www.google.com/maps?q=${result.latitude},${result.longitude}`, "_blank");
  };

  const confidenceColor = (c: string) => {
    if (c === "high") return "border-green-400/50 text-green-400";
    if (c === "medium") return "border-yellow-400/50 text-yellow-400";
    return "border-red-400/50 text-red-400";
  };

  const reset = () => {
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className={cn("flex flex-col gap-4 h-full", className)}>
      {/* Upload Area */}
      {!imagePreview ? (
        <Card className="jarvis-panel flex-1 flex flex-col items-center justify-center gap-6 p-8">
          <Globe className="w-16 h-16 text-primary opacity-60" />
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-1">GeoLocator</h3>
            <p className="text-sm text-muted-foreground">
              Lade ein Foto hoch oder mache eins – J.A.R.V.I.S. erkennt den Standort.
            </p>
          </div>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2">
              <Upload className="w-4 h-4" /> Foto hochladen
            </Button>
            <Button onClick={() => cameraInputRef.current?.click()} variant="outline" className="gap-2">
              <Camera className="w-4 h-4" /> Foto aufnehmen
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          {/* Image Preview + Controls */}
          <Card className="jarvis-panel p-4 flex flex-col gap-3">
            <div className="relative rounded-md overflow-hidden flex-1 min-h-[250px]">
              <img
                src={imagePreview}
                alt="Hochgeladenes Bild"
                className="w-full h-full object-contain bg-black/30"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Analysiere visuelle Hinweise...
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={analyzeImage} disabled={isAnalyzing} className="flex-1 gap-2 bg-primary">
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyse läuft...</>
                ) : (
                  <><Eye className="w-4 h-4" /> Standort erkennen</>
                )}
              </Button>
              <Button onClick={reset} variant="outline" disabled={isAnalyzing}>
                Neu
              </Button>
            </div>
          </Card>

          {/* Results */}
          <Card className="jarvis-panel p-4 flex flex-col gap-3 overflow-y-auto">
            {!result ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                <MapPin className="w-5 h-5 mr-2 opacity-50" /> Klicke auf "Standort erkennen" um zu starten
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-primary" />
                    {result.found ? result.location_name : "Nicht erkannt"}
                  </h3>
                  <Badge variant="outline" className={confidenceColor(result.confidence)}>
                    {result.confidence === "high" ? "Hohe" : result.confidence === "medium" ? "Mittlere" : "Niedrige"} Sicherheit
                  </Badge>
                </div>

                {result.found && (
                  <>
                    {/* Location Info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="jarvis-panel p-2 rounded">
                        <span className="text-muted-foreground">Straße</span>
                        <p className="font-medium">{result.street || "–"}{result.house_number ? ` ${result.house_number}` : ""}</p>
                      </div>
                      <div className="jarvis-panel p-2 rounded">
                        <span className="text-muted-foreground">Stadt</span>
                        <p className="font-medium">{result.city}</p>
                      </div>
                      <div className="jarvis-panel p-2 rounded">
                        <span className="text-muted-foreground">Land</span>
                        <p className="font-medium">{result.country}</p>
                      </div>
                      <div className="jarvis-panel p-2 rounded">
                        <span className="text-muted-foreground">Koordinaten</span>
                        <p className="font-mono text-xs">{result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}</p>
                      </div>
                    </div>

                    {/* Map Button */}
                    <Button onClick={openInMaps} variant="outline" className="gap-2">
                      <ExternalLink className="w-4 h-4" /> In Google Maps öffnen
                    </Button>

                    {/* Map Embed */}
                    <div className="rounded-md overflow-hidden border border-border/30 h-[200px]">
                      <iframe
                        title="Standort"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${result.latitude},${result.longitude}&zoom=14`}
                      />
                    </div>
                  </>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold mb-1">Analyse</h4>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </div>

                {/* Clues */}
                {result.clues?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Erkannte Hinweise</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.clues.map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Landmarks */}
                {result.nearby_landmarks?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Nahegelegene Wahrzeichen</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {result.nearby_landmarks.map((l, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" /> {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
