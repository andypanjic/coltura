import { NextRequest, NextResponse } from "next/server";

interface BallBandData {
  brand?: string;
  fiber?: string;
  weight?: number; // 0 lace to 7 jumbo
  yardage?: number;
  dyeLot?: string;
  colorway?: string;
}

export async function POST(req: NextRequest) {
  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { 
        error: "ANTHROPIC_API_KEY not configured",
        message: "Set ANTHROPIC_API_KEY environment variable to enable ball-band OCR"
      },
      { status: 501 }
    );
  }

  try {
    const { image } = await req.json();
    
    if (!image || !image.startsWith("data:image")) {
      return NextResponse.json(
        { error: "Invalid image data" },
        { status: 400 }
      );
    }

    // Remove data URL prefix to get base64
    const base64Image = image.split(",")[1];

    // Call Anthropic Vision API for structured extraction
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: `Extract information from this yarn ball band. Return ONLY valid JSON with these fields (leave empty string if not found):
{
  "brand": "brand name",
  "fiber": "fiber content (e.g. '100% wool', '80% merino 20% nylon')",
  "weight": yarn weight number 0-7 (0=lace, 1=fingering, 2=sport, 3=DK, 4=worsted, 5=bulky, 6=super bulky, 7=jumbo),
  "yardage": total yardage as number,
  "dyeLot": "dye lot code",
  "colorway": "color name"
}

Look for: brand logos/names, fiber content percentages, weight symbols/numbers, yardage/meters, dye lot numbers, color names. If you see weight symbols (yarn weight icons), convert to 0-7 scale. If yardage is in meters, convert to yards (1m = 1.09361 yards).`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to process image" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Parse the JSON response
    let extractedData: BallBandData;
    try {
      extractedData = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse OCR response");
      }
    }

    // Clean and validate the data
    const result: BallBandData = {
      brand: extractedData.brand || undefined,
      fiber: extractedData.fiber || undefined,
      weight: typeof extractedData.weight === "number" && extractedData.weight >= 0 && extractedData.weight <= 7
        ? extractedData.weight
        : undefined,
      yardage: typeof extractedData.yardage === "number" && extractedData.yardage > 0
        ? Math.round(extractedData.yardage)
        : undefined,
      dyeLot: extractedData.dyeLot || undefined,
      colorway: extractedData.colorway || undefined,
    };

    // Return as draft data (fallible, editable)
    return NextResponse.json({
      draft: result,
      message: "OCR extraction complete. Please review and edit as needed."
    });

  } catch (error) {
    console.error("OCR processing error:", error);
    return NextResponse.json(
      { error: "Failed to process ball band image" },
      { status: 500 }
    );
  }
}