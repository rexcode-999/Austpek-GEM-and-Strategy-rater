import { GemReport, TrendResponse, TrendItem } from "../types";
import { GEM_SYSTEM_PROMPT, TREND_SYSTEM_PROMPT } from "../constants";

const getApiKey = () => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is missing from environment variables.");
  }
  return key;
};

export const fetchTrendsOpenAI = async (): Promise<TrendResponse> => {
  const apiKey = getApiKey();
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: TREND_SYSTEM_PROMPT + " Return the result as a strict JSON array of objects with keys: region, topic, description, viralScore, trendLagStatus, hashtags." },
          { role: "user", content: "Find current viral bathroom trends for US, UK, and AU. Focus on 'Trend Lag'. Return JSON only." }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || response.statusText);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON. OpenAI json_object mode usually wraps arrays in a root object if not specified, 
    // but we can parse the content directly.
    let trends: TrendItem[] = [];
    try {
        const parsed = JSON.parse(content);
        // Handle case where OpenAI wraps it in { "trends": [...] } or similar due to json_object enforcement
        if (Array.isArray(parsed)) {
            trends = parsed;
        } else if (parsed.trends && Array.isArray(parsed.trends)) {
            trends = parsed.trends;
        } else {
            // Last ditch effort: look for array values
            const values = Object.values(parsed);
            const arrayVal = values.find(v => Array.isArray(v));
            if (arrayVal) trends = arrayVal as TrendItem[];
        }
    } catch (e) {
        throw new Error("Failed to parse OpenAI JSON response.");
    }

    // OpenAI does not provide grounding sources in this mode
    return { trends, sources: [] };

  } catch (error: any) {
    console.error("OpenAI Trend fetch error:", error);
    throw new Error(`OpenAI Error: ${error.message}`);
  }
};

export const rateCreativeOpenAI = async (fileBase64: string, mimeType: string): Promise<GemReport> => {
  const apiKey = getApiKey();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: GEM_SYSTEM_PROMPT },
          { 
            role: "user", 
            content: [
              { type: "text", text: "Analyze this creative against the Meta GEM 2026 framework. Return valid JSON." },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${fileBase64}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || response.statusText);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return JSON.parse(content) as GemReport;

  } catch (error: any) {
    console.error("OpenAI Rating error:", error);
    throw new Error(`OpenAI Error: ${error.message}`);
  }
};
