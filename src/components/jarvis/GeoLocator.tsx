import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, 
  Upload, 
  Globe, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Camera,
  Target,
  Compass,
  Map
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GeoLocatorProps {
  className?: string;
}

interface GeoResult {
  location: {
    country: string;
    region?: string;
    city?: string;
    area?: string;
    coordinates?: {
      lat: number | null;
      lng: number | null;
    };
  };
  confidence: "hoch" | "mittel" | "niedrig";
  evidence: string[];
  analysis: string;
  alternativeLocations?: {
    location: string;
    reason: string;
  }[];
}

export const GeoLocator = ({ className }: GeoLocatorProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<GeoResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Bitte wählen Sie eine Bilddatei aus");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke("geo-analyze", {
        body: { image: selectedImage }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setResult(data.data);
      toast.success("Standort-Analyse abgeschlossen!");
    } catch (error) {
      console.error("Geo-analysis error:", error);
      toast.error("Fehler bei der Analyse: " + (error instanceof Error ? error.message : "Unbekannter Fehler"));
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "hoch": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "mittel": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "niedrig": return "bg-red-500/20 text-red-400 border-red-500/50";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const openInMaps = () => {
    if (!result?.location) return;
    
    const { coordinates, city, country } = result.location;
    let url: string;
    
    if (coordinates?.lat && coordinates?.lng) {
      url = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    } else {
      const query = [city, country].filter(Boolean).join(", ");
      url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    }
    
    window.open(url, "_blank");
  };

  return (
    <div className={cn("jarvis-panel p-6 h-full flex flex-col", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/20">
          <Globe className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold jarvis-glow">GeoLocator</h3>
          <p className="text-sm text-muted-foreground">
            KI-gestützte Standortbestimmung aus Bildern
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6">
          {/* Upload Area */}
          <Card 
            className={cn(
              "border-2 border-dashed transition-all cursor-pointer",
              selectedImage ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-primary/30"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {selectedImage ? (
              <div className="relative">
                <img 
                  src={selectedImage} 
                  alt="Ausgewähltes Bild" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                  <div className="text-center text-white">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Klicken zum Ändern</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  Bild hier ablegen oder klicken zum Auswählen
                </p>
                <p className="text-xs text-muted-foreground/60">
                  JPG, PNG, WebP - Max. 10MB
                </p>
              </div>
            )}
          </Card>

          {/* Analyze Button */}
          {selectedImage && (
            <Button 
              onClick={analyzeImage} 
              disabled={isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analysiere Standort...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5 mr-2" />
                  Standort ermitteln
                </>
              )}
            </Button>
          )}

          {/* Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Analysiere visuelle Hinweise...
              </p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4">
              {/* Location Header */}
              <Card className="p-4 bg-primary/10 border-primary/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">
                        {result.location.city || result.location.region || result.location.country}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {[
                          result.location.area,
                          result.location.city && result.location.region,
                          result.location.region && result.location.country
                        ].filter(Boolean).join(", ") || result.location.country}
                      </p>
                      {result.location.coordinates?.lat && result.location.coordinates?.lng && (
                        <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                          {result.location.coordinates.lat.toFixed(4)}°, {result.location.coordinates.lng.toFixed(4)}°
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={getConfidenceColor(result.confidence)}>
                    {result.confidence === "hoch" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {result.confidence === "niedrig" && <AlertCircle className="w-3 h-3 mr-1" />}
                    {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)}
                  </Badge>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full"
                  onClick={openInMaps}
                >
                  <Map className="w-4 h-4 mr-2" />
                  In Google Maps öffnen
                </Button>
              </Card>

              {/* Evidence */}
              {result.evidence && result.evidence.length > 0 && (
                <Card className="p-4">
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-primary" />
                    Gefundene Hinweise
                  </h5>
                  <ul className="space-y-2">
                    {result.evidence.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Analysis */}
              <Card className="p-4">
                <h5 className="font-medium mb-3">Detaillierte Analyse</h5>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.analysis}
                </p>
              </Card>

              {/* Alternative Locations */}
              {result.alternativeLocations && result.alternativeLocations.length > 0 && (
                <Card className="p-4">
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Alternative Möglichkeiten
                  </h5>
                  <div className="space-y-2">
                    {result.alternativeLocations.map((alt, index) => (
                      <div key={index} className="p-2 bg-muted/30 rounded-lg">
                        <p className="text-sm font-medium">{alt.location}</p>
                        <p className="text-xs text-muted-foreground">{alt.reason}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
