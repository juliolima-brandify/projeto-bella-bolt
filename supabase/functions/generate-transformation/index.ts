import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.87.1";

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
  leadId?: string;
}

// Initialize Supabase client with service role for full access
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Generate SHA-256 hash for cache key
async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Convert base64 to blob for upload
function base64ToBlob(base64: string): Blob {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: "image/png" });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const startTime = Date.now();
  let leadId: string | null = null;

  try {
    const {
      imageBase64,
      currentWeight,
      goalWeight,
      height,
      leadId: requestLeadId,
    }: TransformationRequest = await req.json();

    leadId = requestLeadId || null;

    if (!imageBase64 || !currentWeight || !goalWeight || !height) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate hash for cache lookup
    const imageHash = await generateHash(imageBase64);

    // Check cache first
    const { data: cachedTransformation } = await supabase
      .from("image_transformations")
      .select("transformed_url")
      .eq("original_hash", imageHash)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cachedTransformation?.transformed_url) {
      console.log("Cache hit - returning cached transformation");

      // Log successful cache hit
      if (leadId) {
        await supabase.from("transformation_logs").insert({
          lead_id: leadId,
          status: "success",
          processing_time_ms: Date.now() - startTime,
        });
      }

      return new Response(
        JSON.stringify({
          transformedImage: cachedTransformation.transformed_url,
          cached: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // No cache - generate new transformation with OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const weightDiff = currentWeight - goalWeight;
    const bmiCurrent = currentWeight / Math.pow(height / 100, 2);
    const bmiGoal = goalWeight / Math.pow(height / 100, 2);

    // Optimized prompt for faster, natural results
    const prompt = `Create a realistic body transformation showing weight loss of ${weightDiff.toFixed(1)}kg. Transform from BMI ${bmiCurrent.toFixed(1)} to BMI ${bmiGoal.toFixed(1)}. Show natural fat reduction, more defined features, healthier appearance. Keep same pose, clothing, background. Realistic, encouraging, natural-looking result.`;

    // Call OpenAI DALL-E 3 API
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url",
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API failed: ${errorText}`);
    }

    const openaiResult = await openaiResponse.json();
    const generatedImageUrl = openaiResult.data?.[0]?.url;

    if (!generatedImageUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    // Download the generated image
    const imageResponse = await fetch(generatedImageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to download generated image");
    }

    const imageBlob = await imageResponse.blob();
    const fileName = `${crypto.randomUUID()}.png`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("transformed-images")
      .upload(fileName, imageBlob, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("transformed-images")
      .getPublicUrl(fileName);

    const transformedUrl = publicUrlData.publicUrl;

    // Save to cache
    const { error: cacheError } = await supabase
      .from("image_transformations")
      .insert({
        lead_id: leadId,
        original_hash: imageHash,
        transformed_url: transformedUrl,
      });

    if (cacheError) {
      console.error("Cache insert error:", cacheError);
    }

    // Log successful transformation
    if (leadId) {
      await supabase.from("transformation_logs").insert({
        lead_id: leadId,
        status: "success",
        processing_time_ms: Date.now() - startTime,
      });
    }

    return new Response(
      JSON.stringify({
        transformedImage: transformedUrl,
        cached: false,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);

    // Log error
    if (leadId) {
      await supabase.from("transformation_logs").insert({
        lead_id: leadId,
        status: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        processing_time_ms: Date.now() - startTime,
      });
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        fallback: true,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});