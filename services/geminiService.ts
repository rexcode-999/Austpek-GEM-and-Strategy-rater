import { GoogleGenAI } from "@google/genai";
import { GemReport, TrendResponse, WebSource, TrendItem } from "../types";
import { GEM_RESPONSE_SCHEMA, GEM_SYSTEM_PROMPT, TREND_SYSTEM_PROMPT } from "../constants";

// Helper to get fresh client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables. Please check your configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchTrends = async (): Promise<TrendResponse> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Find current viral bathroom trends for US, UK, and AU. Focus on 'Trend Lag'. Return the result as a strict JSON array of objects with keys: region, topic, description, viralScore, trendLagStatus, hashtags. Do not use Markdown formatting.",
      config: {
        systemInstruction: TREND_SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        // Note: responseSchema and responseMimeType are NOT allowed when using googleSearch tool
      }
    });

    let trends: TrendItem[] = [];
    const sources: WebSource[] = [];

    const text = response.text || "";

    // Robust JSON Extraction: Find the outer-most array brackets
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      try {
        trends = JSON.parse(jsonMatch[0]) as TrendItem[];
      } catch (e) {
        console.warn("Regex JSON parse failed, attempting cleanup fallback.");
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        trends = JSON.parse(cleanText) as TrendItem[];
      }
    } else {
        // Fallback for when regex fails (e.g. single object instead of array or plain text)
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        if (cleanText.startsWith('[')) {
             trends = JSON.parse(cleanText) as TrendItem[];
        } else {
            console.error("Invalid Response Text:", text);
            throw new Error("Model response did not contain valid JSON trend data.");
        }
    }

    // Extract Grounding Sources
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Source",
            uri: chunk.web.uri
          });
        }
      });
    }

    if (trends.length > 0) {
      return { trends, sources };
    }
    
    throw new Error("No trend data found in model response.");

  } catch (error: any) {
    console.error("Trend fetch error:", error);
    
    // enhance error message
    let msg = error.message || "Unknown error";
    if (msg.includes("403")) msg = "Access Denied (403). Check API Key.";
    if (msg.includes("404")) msg = "Model 'gemini-3-flash-preview' not found (404).";
    if (msg.includes("429")) msg = "Rate limit exceeded (429). Please wait a moment.";
    if (msg.includes("503")) msg = "Service overloaded (503). Try again later.";
    
    throw new Error(msg);
  }
};

export const rateCreative = async (fileBase64: string, mimeType: string): Promise<GemReport> => {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for complex reasoning on images/video
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          {
            text: "Analyze this creative against the Meta GEM 2026 framework."
          }
        ]
      },
      config: {
        systemInstruction: GEM_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: GEM_RESPONSE_SCHEMA,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GemReport;
    }
    throw new Error("No text returned from Gemini analysis.");
  } catch (error: any) {
    console.error("Rating error:", error);

    let msg = error.message || "Unknown error";
    if (msg.includes("413") || msg.includes("too large")) msg = "File too large for API. Please use a file under 20MB.";
    if (msg.includes("404")) msg = "Model 'gemini-3-pro-preview' not found (404).";
    if (msg.includes("429")) msg = "Rate limit exceeded (429).";
    
    throw new Error(msg);
  }
};
