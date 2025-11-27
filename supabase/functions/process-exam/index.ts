import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file, filename } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare the message for the AI
    const systemPrompt = `You are a medical exam analyzer. Extract ALL health markers from the provided medical exam document.

IMPORTANT: Extract EVERY marker found in the document, not just common ones. Include:
- Blood tests (Hemograma: hemácias, hemoglobina, hematócrito, leucócitos, plaquetas, etc.)
- Biochemistry (Glicose, Ureia, Creatinina, Ácido úrico, etc.)
- Lipid profile (Colesterol Total, HDL, LDL, Triglicerídeos, etc.)
- Liver function (TGO, TGP, GGT, Bilirrubinas, Fosfatase alcalina, etc.)
- Thyroid (TSH, T3, T4, T4 Livre, etc.)
- Hormones (Testosterona, Cortisol, Prolactina, etc.)
- Vitamins (Vitamina D, B12, Ácido fólico, Ferritina, etc.)
- Minerals (Ferro, Cálcio, Magnésio, Potássio, Sódio, etc.)
- Proteins (Proteínas totais, Albumina, Globulinas, etc.)
- Cardiac markers (Troponina, CK-MB, BNP, etc.)
- Inflammatory markers (PCR, VHS, etc.)
- Diabetes markers (Hemoglobina Glicada, Insulina, Peptídeo C, etc.)
- ANY other health marker present in the document

Return a JSON object with this exact structure:
{
  "markers": [
    {
      "name": "Marker name in Portuguese (exactly as it appears in the exam)",
      "value": "numeric value only (extract the number)",
      "unit": "unit of measurement (mg/dL, g/dL, %, etc.)"
    }
  ]
}

Extract the numeric value only (no text). If a marker has a range or multiple values, extract the main value.
Return ONLY the JSON object, no additional text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the health markers from this exam:" },
              { type: "image_url", image_url: { url: file } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI processing failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from AI");
    }

    // Parse the JSON response
    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      result = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse exam data from AI response");
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in process-exam:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
