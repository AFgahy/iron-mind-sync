import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      throw new Error('Image is required');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Starting geo-location analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Du bist ein Experte für Geolokalisierung von Bildern, ähnlich wie GeoSpy. Analysiere das Bild und versuche den genauen Aufnahmeort zu bestimmen.

Achte auf:
- Straßenschilder, Wegweiser, Werbetafeln (Sprache, Schrift)
- Architekturstil der Gebäude
- Vegetation und Landschaft
- Fahrzeuge und Nummernschilder
- Kleidung und kulturelle Hinweise
- Sonnenstund/Schatten für Breitengrad
- Marken, Logos, Geschäfte
- Strommasten, Straßenlampen-Design
- Bodenmarkierungen und Verkehrszeichen

Antworte im folgenden JSON-Format:
{
  "location": {
    "country": "Land",
    "region": "Region/Bundesland",
    "city": "Stadt (falls erkennbar)",
    "area": "Genauere Gegend/Stadtteil (falls erkennbar)",
    "coordinates": {
      "lat": null oder Schätzung,
      "lng": null oder Schätzung
    }
  },
  "confidence": "hoch/mittel/niedrig",
  "evidence": [
    "Beweis 1: Beschreibung",
    "Beweis 2: Beschreibung"
  ],
  "analysis": "Ausführliche Erklärung der Analyse",
  "alternativeLocations": [
    {
      "location": "Alternative Möglichkeit",
      "reason": "Warum auch möglich"
    }
  ]
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analysiere dieses Bild und bestimme wo auf der Welt es aufgenommen wurde. Sei so präzise wie möglich und erkläre deine Schlussfolgerungen."
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Geo-analysis failed");
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;

    if (!analysisText) {
      throw new Error("No analysis generated");
    }

    console.log("Geo-analysis completed successfully");

    // Try to parse JSON from the response
    let parsedAnalysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        analysisText.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : analysisText;
      parsedAnalysis = JSON.parse(jsonStr);
    } catch {
      // If JSON parsing fails, return as text
      parsedAnalysis = { 
        analysis: analysisText,
        location: { country: "Unbekannt" },
        confidence: "niedrig",
        evidence: []
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: parsedAnalysis 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Geo-analysis error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
