export type CriterionId =
  | "accuracy"
  | "clarity"
  | "relevance"
  | "safety"
  | "tone";

export type Score = 1 | 2 | 3 | 4 | 5;

export type EvaluationMode = "single" | "ab";

export type ABMargin = "CLEAR" | "NARROW";

export type ABWinner = "A" | "B" | "TIE";

// ── Single-mode result ──────────────────────────────────────────────────────

export interface CriterionScore {
  criterionId: CriterionId;
  score: Score;
  rationale: string;
}

export interface SingleEvaluationResult {
  mode: "single";
  model: string;
  prompt: string;
  response: string;
  scores: CriterionScore[];
  weightedTotal: number; // 0–100
  overallRationale: string;
  timestamp: number;
}

// ── A/B-mode result ─────────────────────────────────────────────────────────

export interface CriterionComparison {
  criterionId: CriterionId;
  winner: ABWinner;
  margin: ABMargin;
  rationale: string;
}

export interface ABEvaluationResult {
  mode: "ab";
  model: string;
  prompt: string;
  responseA: string;
  responseB: string;
  comparisons: CriterionComparison[];
  overallWinner: ABWinner;
  overallRationale: string;
  timestamp: number;
}

export type EvaluationResult = SingleEvaluationResult | ABEvaluationResult;

// ── API shapes ───────────────────────────────────────────────────────────────

export interface GeminiRequestPayload {
  contents: Array<{ role: string; parts: Array<{ text: string }> }>;
  generationConfig: {
    temperature: number;
    responseMimeType: string;
  };
}
