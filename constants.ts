import { Type, Schema } from "@google/genai";

export const GEM_SYSTEM_PROMPT = `
You are the Austpek Trend & Ad Strategist. Your goal is to rate ads using the 2026 Meta GEM framework.

Meta GEM 2026 Rating Criteria:
1. Creative Diversity (0-25 pts): Does the ad offer a unique visual style compared to generic bathroom ads?
2. Visual Signal (0-25 pts): Are textures like fluted wood, brushed brass, or stone clearly visible for AI detection?
3. Hook Velocity (0-25 pts): Does the visual "stop the scroll" in under 1 second?
4. Intent Match (0-25 pts): Does the ad target a specific 2026 trend (e.g., "Home Spa" or "Japandi")?

Analyze the provided image or video frame. Return a strict JSON response.
`;

export const TREND_SYSTEM_PROMPT = `
You are the Austpek Trend & Ad Strategist. 
Simulate a search for viral bathroom trends focusing on #bathroomvanity, #luxuryrenovation, and #homedesign across US, UK, and AU.
Identify "Trend Lag"—what is big in the US/UK that hasn't hit Australia yet.
Return a strict JSON response.
`;

export const GEM_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    totalScore: { type: Type.INTEGER, description: "Sum of all scores" },
    breakdown: {
      type: Type.OBJECT,
      properties: {
        creativeDiversity: { type: Type.INTEGER },
        visualSignal: { type: Type.INTEGER },
        hookVelocity: { type: Type.INTEGER },
        intentMatch: { type: Type.INTEGER },
      },
      required: ["creativeDiversity", "visualSignal", "hookVelocity", "intentMatch"]
    },
    reasoning: {
      type: Type.OBJECT,
      properties: {
        creativeDiversity: { type: Type.STRING },
        visualSignal: { type: Type.STRING },
        hookVelocity: { type: Type.STRING },
        intentMatch: { type: Type.STRING },
      },
      required: ["creativeDiversity", "visualSignal", "hookVelocity", "intentMatch"]
    },
    matchedTrend: { type: Type.STRING, description: "The specific 2026 trend this ad targets" },
    improvementTips: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "3 actionable tips to improve the GEM score" 
    }
  },
  required: ["totalScore", "breakdown", "reasoning", "matchedTrend", "improvementTips"]
};

export const TREND_RESPONSE_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      region: { type: Type.STRING, enum: ["US", "UK", "AU"] },
      topic: { type: Type.STRING },
      description: { type: Type.STRING },
      viralScore: { type: Type.INTEGER },
      trendLagStatus: { type: Type.STRING, description: "Explanation of the trend lag between regions" },
      hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["region", "topic", "description", "viralScore", "trendLagStatus", "hashtags"]
  }
};
