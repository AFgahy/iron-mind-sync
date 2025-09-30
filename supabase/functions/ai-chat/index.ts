import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AI Router: Intelligente Modellauswahl basierend auf Task-Typ
interface AIModel {
  name: string;
  id: string;
  strengths: string[];
  cost: number; // 1=lowest, 5=highest
}

const availableModels: AIModel[] = [
  {
    name: "Gemini 2.5 Flash",
    id: "google/gemini-2.5-flash",
    strengths: ["conversation", "general", "fast", "multilingual"],
    cost: 1
  },
  {
    name: "Gemini 2.5 Flash Lite",
    id: "google/gemini-2.5-flash-lite",
    strengths: ["simple", "classification", "summarization"],
    cost: 1
  },
  {
    name: "Gemini 2.5 Pro",
    id: "google/gemini-2.5-pro",
    strengths: ["reasoning", "complex", "analysis", "multimodal", "vision"],
    cost: 3
  },
  {
    name: "GPT-5 Nano",
    id: "openai/gpt-5-nano",
    strengths: ["fast", "simple", "classification"],
    cost: 2
  },
  {
    name: "GPT-5 Mini",
    id: "openai/gpt-5-mini",
    strengths: ["code", "technical", "balanced", "programming"],
    cost: 3
  },
  {
    name: "GPT-5",
    id: "openai/gpt-5",
    strengths: ["complex", "reasoning", "accuracy", "nuance", "expert"],
    cost: 5
  }
];

function analyzeTaskType(messages: Array<{ role: string; content: string }>): string[] {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || "";
  const keywords: string[] = [];

  // Code-bezogen
  if (/code|programm|function|class|debug|fehler|bug|algorithm/i.test(lastMessage)) {
    keywords.push("code", "technical", "programming");
  }

  // Komplexe Analyse
  if (/analysier|berechne|vergleich|erkläre detailliert|komplex|philosophie/i.test(lastMessage)) {
    keywords.push("complex", "reasoning", "analysis");
  }

  // Einfache Aufgaben
  if (/zusammenfass|kurz|schnell|liste|ja\/nein|klassifizier/i.test(lastMessage)) {
    keywords.push("simple", "fast", "classification", "summarization");
  }

  // Multimodal/Vision (wenn Bilder erwähnt werden)
  if (/bild|foto|visualisier|zeig mir|schau/i.test(lastMessage)) {
    keywords.push("vision", "multimodal");
  }

  // Standard Konversation
  if (keywords.length === 0) {
    keywords.push("conversation", "general");
  }

  return keywords;
}

function selectBestModel(taskKeywords: string[]): AIModel {
  console.log("🔍 Analyzing task with keywords:", taskKeywords);

  // Score jedes Modell basierend auf Task-Keywords
  const scoredModels = availableModels.map(model => {
    const matchScore = taskKeywords.filter(keyword => 
      model.strengths.includes(keyword)
    ).length;
    
    // Bevorzuge günstigere Modelle bei gleichem Score
    const finalScore = matchScore - (model.cost * 0.1);
    
    return { model, score: finalScore };
  });

  // Sortiere nach Score (höher = besser)
  scoredModels.sort((a, b) => b.score - a.score);

  const selectedModel = scoredModels[0].model;
  console.log("✨ Selected model:", selectedModel.name, "with score:", scoredModels[0].score);
  
  return selectedModel;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // 🤖 Intelligente Modellauswahl
    const taskKeywords = analyzeTaskType(messages);
    const selectedModel = selectBestModel(taskKeywords);
    
    console.log("📨 Processing request with model:", selectedModel.name);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel.id,
        messages: [
          { 
            role: "system", 
            content: `Du bist J.A.R.V.I.S., ein fortschrittlicher KI-Assistent basierend auf ${selectedModel.name}. Du bist hilfsbereit, präzise und effizient. Antworte auf Deutsch.` 
          },
          ...messages,
        ],
        stream: true,
        metadata: {
          selectedModel: selectedModel.name,
          taskType: taskKeywords.join(", ")
        }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit erreicht. Bitte versuche es später erneut." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Zahlungspflichtig. Bitte füge Credits hinzu." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway Fehler:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI Gateway Fehler" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat Fehler:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unbekannter Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
