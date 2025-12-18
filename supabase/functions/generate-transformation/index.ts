import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, currentWeight, goalWeight, height } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing transformation request:", { currentWeight, goalWeight, height });

    // Calculate weight difference for prompt
    const weightDiff = currentWeight - goalWeight;
    const heightInMeters = height / 100;
    const idealBMI = goalWeight / (heightInMeters * heightInMeters);

    const fatReductionPercentage = Math.round((weightDiff / currentWeight) * 100);

    const prompt = `TASK: Transform this full-body photo to show the exact same person after losing ${weightDiff} kg of body fat (${fatReductionPercentage}% reduction). Target weight: ${goalWeight} kg.

BODY TRANSFORMATION - BE AGGRESSIVE AND VISIBLE:
- Significantly slim down the waist, reducing circumference by ${Math.round(fatReductionPercentage * 0.8)}%
- Noticeably reduce arm thickness, especially upper arms
- Slim down the thighs and legs proportionally
- Reduce face roundness and define jawline more
- Remove visible belly fat and love handles
- Reduce hip width proportionally
- The change must be CLEARLY VISIBLE and dramatic - this person is losing ${weightDiff} kg

PRESERVE EXACTLY (DO NOT CHANGE):
- Same face identity, eyes, nose, mouth, hair color and style
- Same exact clothing, colors, patterns, accessories
- Same background, lighting, shadows, and environment
- Same pose, position, and camera angle
- Same image resolution and quality

The result should show an obviously slimmer version of the same person. The weight loss of ${weightDiff} kg must be visually apparent and significant.`;

    console.log("Sending request to Lovable AI for image generation...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again in a few moments." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI credits exhausted. Please contact support." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received successfully");

    // Extract the generated image from the response
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image generated in response");
    }

    return new Response(JSON.stringify({ 
      transformedImage: generatedImageUrl,
      success: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-transformation function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
