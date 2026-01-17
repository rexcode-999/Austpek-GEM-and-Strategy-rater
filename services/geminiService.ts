import { GoogleGenAI } from "@google/genai";
import { GemReport, TrendItem } from "../types";
import { GEM_RESPONSE_SCHEMA, GEM_SYSTEM_PROMPT, TREND_RESPONSE_SCHEMA, TREND_SYSTEM_PROMPT } from "../constants";

// Helper to get fresh client
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchTrends = async (): Promise<TrendItem[]> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Find current viral bathroom trends for US, UK, and AU. Focus on 'Trend Lag'.",
      config: {
        systemInstruction: TREND_SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: TREND_RESPONSE_SCHEMA,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as TrendItem[];
    }
    throw new Error("No data received from Gemini");
  } catch (error) {
    console.error("Trend fetch error:", error);
    throw error;
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
    throw new Error("No analysis received from Gemini");
  } catch (error) {
    console.error("Rating error:", error);
    throw error;
  }
};
