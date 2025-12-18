import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GOOGLE_AI_API_KEY = "AIzaSyBXTINQ9Y0f6x_9Lje1lxxor5uTVaQe7dI";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TransformationRequest {
  imageBase64: string;
  currentWeight: number;
  goalWeight: number;
  height: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { imageBase64, currentWeight, goalWeight, height }: TransformationRequest = await req.json();

    if (!imageBase64 || !currentWeight || !goalWeight || !height) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const weightDiff = currentWeight - goalWeight;
    const bmiCurrent = currentWeight / Math.pow(height / 100, 2);
    const bmiGoal = goalWeight / Math.pow(height / 100, 2);

    // Create a prompt for image transformation using Gemini
    const prompt = `Transform this full-body photo to show a realistic visualization of the person after losing ${weightDiff.toFixed(1)}kg. Current weight: ${currentWeight}kg (BMI ${bmiCurrent.toFixed(1)}), Goal weight: ${goalWeight}kg (BMI ${bmiGoal.toFixed(1)}). Make subtle, natural changes focusing on: reduced body fat, more defined features, healthier appearance. Maintain the same pose, clothing, and background. Keep it realistic and encouraging.`;

    // Use Google Gemini API for image generation
    // Note: This uses the Gemini API with vision capabilities
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate transformation", details: errorText }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await response.json();

    // For now, Gemini doesn't generate images directly, it analyzes them
    // We'll return the original image with a text description of changes
    // In a production app, you'd want to use Imagen API or another service
    const transformedImage = imageBase64; // Placeholder - keeping original for now
    const analysis = result.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis not available";

    return new Response(
      JSON.stringify({
        transformedImage,
        analysis,
        message: "Note: Currently using Gemini for analysis. For actual image transformation, Imagen API integration is needed.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
