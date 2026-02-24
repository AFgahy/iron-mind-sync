import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function authenticateRequest(req: Request): Promise<{ user: any; error: Response | null }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  return { user: data.user, error: null };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user, error: authError } = await authenticateRequest(req);
    if (authError) return authError;

    const { imageBase64 } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(
        JSON.stringify({ error: 'imageBase64 is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit image size (max ~10MB base64)
    if (imageBase64.length > 14_000_000) {
      return new Response(
        JSON.stringify({ error: 'Image too large. Max 10MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("📍 Geolocating image for user:", user.id);

    // Use Gemini 2.5 Pro for vision analysis
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `Du bist ein Experte für Geolokalisierung. Analysiere das Bild und identifiziere den genauen oder ungefähren Standort anhand visueller Hinweise wie:
- Architektur, Gebäude, Wahrzeichen
- Straßenschilder, Beschriftungen, Sprache auf Schildern
- Vegetation, Landschaft, Gelände
- Fahrzeuge, Nummernschilder
- Wetter, Lichtverhältnisse
- Kulturelle Hinweise

Antworte IMMER im folgenden JSON-Format (kein Markdown, nur reines JSON):
{
  "found": true/false,
  "confidence": "high"/"medium"/"low",
  "latitude": 0.0,
  "longitude": 0.0,
  "location_name": "Name des Ortes",
  "country": "Land",
  "city": "Stadt/Region",
  "street": "Straßenname (falls erkennbar)",
  "house_number": "Hausnummer (falls erkennbar)",
  "description": "Detaillierte Erklärung, warum du diesen Standort vermutest",
  "clues": ["Hinweis 1", "Hinweis 2", "Hinweis 3"],
  "nearby_landmarks": ["Wahrzeichen 1", "Wahrzeichen 2"]
}

Wenn du den Standort nicht identifizieren kannst, setze "found" auf false und erkläre warum. Versuche immer so genau wie möglich zu sein – identifiziere Straßennamen und Hausnummern wenn möglich anhand von Schildern, Gebäuden oder sonstigen Hinweisen.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analysiere dieses Bild und identifiziere den genauen Standort. Gib mir Koordinaten und eine detaillierte Erklärung."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let locationData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        locationData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Raw content:", content);
      locationData = {
        found: false,
        confidence: "low",
        latitude: 0,
        longitude: 0,
        location_name: "Unbekannt",
        country: "Unbekannt",
        city: "Unbekannt",
        street: "",
        house_number: "",
        description: content,
        clues: [],
        nearby_landmarks: []
      };
    }

    return new Response(
      JSON.stringify(locationData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Geolocate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
