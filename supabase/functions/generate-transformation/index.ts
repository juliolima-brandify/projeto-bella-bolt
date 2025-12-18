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

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getGoogleAccessToken(): Promise<string> {
  const clientEmail = Deno.env.get("GOOGLE_CLOUD_CLIENT_EMAIL");
  const privateKey = Deno.env.get("GOOGLE_CLOUD_PRIVATE_KEY");
  
  if (!clientEmail || !privateKey) {
    throw new Error("Google Cloud credentials not configured");
  }

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const privateKeyData = privateKey.replace(/\\n/g, "\n");
  const keyData = privateKeyData.match(/-----BEGIN PRIVATE KEY-----([\s\S]+?)-----END PRIVATE KEY-----/);
  
  if (!keyData) {
    throw new Error("Invalid private key format");
  }

  const pemContents = keyData[1].replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${unsignedToken}.${encodedSignature}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function generateImageWithVertexAI(
  prompt: string,
  accessToken: string
): Promise<string> {
  const projectId = Deno.env.get("GOOGLE_CLOUD_PROJECT_ID");
  const location = Deno.env.get("GOOGLE_CLOUD_LOCATION") || "us-central1";

  if (!projectId) {
    throw new Error("GOOGLE_CLOUD_PROJECT_ID not configured");
  }

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;

  const requestBody = {
    instances: [
      {
        prompt: prompt,
      },
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: "1:1",
      safetySetting: "block_some",
      personGeneration: "allow_adult",
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vertex AI API failed: ${error}`);
  }

  const result = await response.json();
  const imageBase64 = result.predictions?.[0]?.bytesBase64Encoded;

  if (!imageBase64) {
    throw new Error("No image data returned from Vertex AI");
  }

  return imageBase64;
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

    const imageHash = await generateHash(imageBase64);

    const { data: cachedTransformation } = await supabase
      .from("image_transformations")
      .select("transformed_url")
      .eq("original_hash", imageHash)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cachedTransformation?.transformed_url) {
      console.log("Cache hit - returning cached transformation");

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

    const weightDiff = currentWeight - goalWeight;
    const bmiCurrent = currentWeight / Math.pow(height / 100, 2);
    const bmiGoal = goalWeight / Math.pow(height / 100, 2);

    const prompt = `A realistic before and after body transformation photo showing healthy weight loss of ${weightDiff.toFixed(1)}kg. The person starts at BMI ${bmiCurrent.toFixed(1)} and achieves BMI ${bmiGoal.toFixed(1)}. Show natural fat reduction, more defined muscle tone, improved posture, and a healthier, more energetic appearance. The person should look confident and happy with their transformation. Professional fitness photography style, natural lighting, motivational and inspiring.`;

    console.log("Generating access token...");
    const accessToken = await getGoogleAccessToken();

    console.log("Generating image with Vertex AI...");
    const generatedImageBase64 = await generateImageWithVertexAI(prompt, accessToken);

    const imageBytes = Uint8Array.from(atob(generatedImageBase64), c => c.charCodeAt(0));
    const imageBlob = new Blob([imageBytes], { type: "image/png" });
    const fileName = `${crypto.randomUUID()}.png`;

    console.log("Uploading to Supabase Storage...");
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

    const { data: publicUrlData } = supabase.storage
      .from("transformed-images")
      .getPublicUrl(fileName);

    const transformedUrl = publicUrlData.publicUrl;

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