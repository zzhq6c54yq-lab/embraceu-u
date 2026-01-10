import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if nebula image already exists
    const { data: existingFiles } = await supabase.storage
      .from("nebula-backgrounds")
      .list("", { limit: 1, search: "cosmic-nebula" });

    if (existingFiles && existingFiles.length > 0) {
      const { data: urlData } = supabase.storage
        .from("nebula-backgrounds")
        .getPublicUrl(existingFiles[0].name);
      
      return new Response(
        JSON.stringify({ url: urlData.publicUrl, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate new nebula image using Lovable AI
    const prompt = `A stunning bright cosmic nebula background for a wellness meditation app. Vibrant flowing aurora waves in rich pink, purple, teal, cyan, and gold colors. Ethereal and dreamy atmosphere with soft glowing light streams and subtle star particles. The colors should be bright and saturated but harmonious. Seamless edges suitable for a full-screen background. Ultra high resolution, 16:9 aspect ratio. Soft gradients blending between cosmic purple, electric pink, turquoise, and warm gold. A sense of infinite peaceful space.`;

    console.log("Generating nebula image with Lovable AI...");

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
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image generated");
    }

    // Extract base64 data
    const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image format");
    }

    const [, imageType, base64Data] = base64Match;
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Upload to Supabase Storage
    const fileName = `cosmic-nebula-${Date.now()}.${imageType}`;
    const { error: uploadError } = await supabase.storage
      .from("nebula-backgrounds")
      .upload(fileName, imageBytes, {
        contentType: `image/${imageType}`,
        cacheControl: "31536000", // 1 year cache
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("nebula-backgrounds")
      .getPublicUrl(fileName);

    console.log("Nebula image generated and uploaded:", publicUrlData.publicUrl);

    return new Response(
      JSON.stringify({ url: publicUrlData.publicUrl, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating nebula:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
