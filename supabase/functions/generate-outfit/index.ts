import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  userImage: string;
  outfitDescription: string;
  viewType: "front" | "left" | "right" | "back" | "outfit";
}

const viewPrompts: Record<string, string> = {
  front: "Full-body front view, facing directly forward, neutral stance, outfit fully visible",
  left: "Full-body left view, exact 90° left side profile, same pose and alignment",
  right: "Full-body right view, exact 90° right side profile, same pose and alignment", 
  back: "Full-body back view, facing directly backward, outfit details visible from the back",
  outfit: "ONLY the outfit on transparent background, no human body, no mannequin, no shadows, centered and symmetrically aligned, clean edges suitable for e-commerce product cards",
};

function logApiUsage(response: Response, viewType: string) {
  console.log("=== API Usage Limits ===");
  console.log(`View Type: ${viewType}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  // Log all rate limit related headers
  const rateLimitHeaders = [
    "x-ratelimit-limit",
    "x-ratelimit-remaining", 
    "x-ratelimit-reset",
    "x-ratelimit-limit-requests",
    "x-ratelimit-remaining-requests",
    "x-ratelimit-limit-tokens",
    "x-ratelimit-remaining-tokens",
    "x-ratelimit-reset-requests",
    "x-ratelimit-reset-tokens",
    "retry-after",
    "x-request-id",
  ];

  let foundHeaders = false;
  rateLimitHeaders.forEach((header) => {
    const value = response.headers.get(header);
    if (value) {
      console.log(`  ${header}: ${value}`);
      foundHeaders = true;
    }
  });

  if (!foundHeaders) {
    console.log("  No rate limit headers found in response");
  }

  // Log response status
  console.log(`Response Status: ${response.status}`);
  console.log("========================");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userImage, outfitDescription, viewType } = await req.json() as GenerateRequest;

    if (!userImage || !outfitDescription || !viewType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userImage, outfitDescription, viewType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const viewPrompt = viewPrompts[viewType];
    
    const systemPrompt = `You are a professional fashion AI designer and virtual try-on specialist. 
Your task is to transform a user's image into a realistic outfit visualization.

CRITICAL REQUIREMENTS:
- Preserve the user's body proportions, pose, and alignment
- Do not alter facial features, body shape, or posture
- Ensure clothing aligns naturally with shoulders, waist, arms, and legs
- Apply realistic folds, shadows, stitching, and fabric texture
- Use neutral, studio-style lighting
- Plain, uncluttered background
- No text, logos, watermarks, or props
- Clean edges suitable for background removal
- High realism suitable for fashion catalog`;

    const userPrompt = `Transform this person's image into a virtual try-on visualization.

OUTFIT DESCRIPTION: ${outfitDescription}

VIEW REQUIREMENT: ${viewPrompt}

Generate a photorealistic, commercially-usable fashion visualization with exact outfit consistency.`;

    console.log(`Starting image generation for view: ${viewType}`);
    console.log(`Outfit description: ${outfitDescription.substring(0, 100)}...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: userImage } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    // Log API usage limits
    logApiUsage(response, viewType);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI gateway error: ${response.status} - ${errorText}`);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Log token usage from response body if available
    if (data.usage) {
      console.log("=== Token Usage from Response ===");
      console.log(`  Prompt tokens: ${data.usage.prompt_tokens || "N/A"}`);
      console.log(`  Completion tokens: ${data.usage.completion_tokens || "N/A"}`);
      console.log(`  Total tokens: ${data.usage.total_tokens || "N/A"}`);
      console.log("=================================");
    }

    // Parse image from different possible response structures
    const messageContent = data.choices?.[0]?.message?.content;
    let generatedImage: string | null = null;
    let textResponse: string | null = null;

    // Handle array content (multimodal response)
    if (Array.isArray(messageContent)) {
      for (const part of messageContent) {
        if (part.type === "image_url" && part.image_url?.url) {
          generatedImage = part.image_url.url;
        } else if (part.type === "image" && part.image?.url) {
          generatedImage = part.image.url;
        } else if (part.type === "text") {
          textResponse = part.text;
        }
      }
    } else if (typeof messageContent === "string") {
      textResponse = messageContent;
    }

    // Also check for images in dedicated field
    if (!generatedImage && data.choices?.[0]?.message?.images?.[0]) {
      const imageData = data.choices[0].message.images[0];
      generatedImage = imageData.image_url?.url || imageData.url || imageData;
    }

    // Log the response structure for debugging
    console.log("Response structure:", JSON.stringify(data.choices?.[0]?.message, null, 2).substring(0, 500));

    if (!generatedImage) {
      console.error("No image generated in response");
      return new Response(
        JSON.stringify({ error: "No image was generated", textResponse }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully generated ${viewType} view image`);

    return new Response(
      JSON.stringify({ 
        imageUrl: generatedImage,
        viewType,
        textResponse 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-outfit function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
