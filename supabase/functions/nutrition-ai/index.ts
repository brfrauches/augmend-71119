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
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'calculate-macros':
        systemPrompt = `Você é um nutricionista especializado. Calcule macros precisos para a refeição descrita.
        Retorne APENAS um JSON válido sem texto adicional, no formato:
        {
          "total_calories": número,
          "protein_g": número,
          "carbs_g": número,
          "fat_g": número,
          "items": [
            {
              "name": "nome do alimento",
              "calories": número,
              "protein_g": número,
              "carbs_g": número,
              "fat_g": número,
              "quantity": "porção estimada"
            }
          ]
        }`;
        userPrompt = `Refeição: ${data.description}`;
        break;

      case 'analyze-photo':
        systemPrompt = `Você é um nutricionista especializado. Analise a foto da refeição e identifique os alimentos visíveis.
        Retorne APENAS um JSON válido sem texto adicional, no formato:
        {
          "total_calories": número,
          "protein_g": número,
          "carbs_g": número,
          "fat_g": número,
          "items": [
            {
              "name": "nome do alimento",
              "calories": número,
              "protein_g": número,
              "carbs_g": número,
              "fat_g": número,
              "quantity": "porção estimada"
            }
          ]
        }`;
        userPrompt = 'Analise a foto desta refeição e calcule os macros';
        break;

      case 'suggest-meal':
        systemPrompt = `Você é um nutricionista especializado. Com base nos dados fornecidos, sugira uma refeição ideal.
        Considere: horário, objetivo, treino realizado, macros consumidos hoje.
        Retorne APENAS um JSON válido sem texto adicional, no formato:
        {
          "name": "nome da refeição sugerida",
          "reasoning": "breve explicação da sugestão",
          "total_calories": número,
          "protein_g": número,
          "carbs_g": número,
          "fat_g": número,
          "items": [
            {
              "name": "ingrediente",
              "calories": número,
              "protein_g": número,
              "carbs_g": número,
              "fat_g": número,
              "quantity": "porção"
            }
          ]
        }`;
        userPrompt = `Dados do usuário: ${JSON.stringify(data)}`;
        break;

      case 'analyze-nutrition':
        systemPrompt = `Você é um nutricionista especializado. Analise os dados nutricionais e de saúde do usuário.
        Forneça insights, alertas e recomendações personalizadas.
        Retorne APENAS um JSON válido sem texto adicional, no formato:
        {
          "insights": ["insight 1", "insight 2"],
          "alerts": ["alerta 1", "alerta 2"],
          "recommendations": ["recomendação 1", "recomendação 2"]
        }`;
        userPrompt = `Dados: ${JSON.stringify(data)}`;
        break;

      default:
        throw new Error('Invalid type');
    }

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // Add image if provided
    if (data.imageUrl) {
      messages[1] = {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: data.imageUrl } }
        ]
      };
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    // Parse JSON from response
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in nutrition-ai function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});