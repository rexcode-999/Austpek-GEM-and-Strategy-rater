export interface TrendItem {
  region: 'US' | 'UK' | 'AU';
  topic: string;
  description: string;
  viralScore: number; // 0-100
  trendLagStatus: string; // Context on US vs AU lag
  hashtags: string[];
}

export interface WebSource {
  title: string;
  uri: string;
}

export interface TrendResponse {
  trends: TrendItem[];
  sources: WebSource[];
}

export interface GemScoreBreakdown {
  creativeDiversity: number; // 0-25
  visualSignal: number; // 0-25
  hookVelocity: number; // 0-25
  intentMatch: number; // 0-25
}

export interface GemReport {
  totalScore: number; // 0-100
  breakdown: GemScoreBreakdown;
  reasoning: {
    creativeDiversity: string;
    visualSignal: string;
    hookVelocity: string;
    intentMatch: string;
  };
  matchedTrend: string;
  improvementTips: string[];
}

export enum AppTab {
  TRENDS = 'trends',
  RATER = 'rater',
}

export enum AiProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai',
}
