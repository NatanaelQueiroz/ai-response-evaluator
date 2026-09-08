import type {
  CriterionId,
  SingleEvaluationResult,
  ABEvaluationResult,
  Score,
  ABWinner,
  ABMargin,
} from "../types/evaluation";
import { RUBRIC, computeWeightedTotal } from "./rubric";

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

export class GeminiApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "GeminiApiError";
  }
}

function buildHeaders(apiKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-goog-api-key": apiKey,
  };
}

async function callGemini(
  model: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<unknown> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent`;

  const body = JSON.stringify({
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(apiKey),
    body,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const err = (await response.json()) as { error?: { message?: string } };
      if (err.error?.message) detail = err.error.message;
    } catch {
      // ignore parse error, use statusText
    }
    throw new GeminiApiError(response.status, detail);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Empty response from Gemini API.");

  // Strip markdown code fences if present
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  try {
    return JSON.parse(cleaned) as unknown;
  } catch {
    throw new Error(
      `Failed to parse Gemini response as JSON.\n\nRaw response:\n${rawText}`
    );
  }
}

// ── Plain text generation (no rubric) ───────────────────────────────────────

export async function generateResponse(
  model: string,
  apiKey: string,
  prompt: string
): Promise<string> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent`;

  const body = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.9 },
  });

  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(apiKey),
    body,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const err = (await response.json()) as { error?: { message?: string } };
      if (err.error?.message) detail = err.error.message;
    } catch {
      // ignore
    }
    throw new GeminiApiError(response.status, detail);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini API.");
  return text;
}

// ── System prompts ───────────────────────────────────────────────────────────

const CRITERIA_BLOCK = RUBRIC.map(
  (c) =>
    `- ${c.id} (weight ${c.weight}): ${c.description}\n  Scores: ${c.descriptors
      .map((d) => `${d.score}=${d.label} (${d.description})`)
      .join("; ")}`
).join("\n");

const SINGLE_SYSTEM = `You are a rigorous AI response evaluator. Score the given AI response on five criteria. Return ONLY valid JSON with no markdown fences.

CRITERIA:
${CRITERIA_BLOCK}

REQUIRED JSON SCHEMA:
{
  "scores": [
    { "criterionId": "<id>", "score": <1-5>, "rationale": "<one sentence>" }
  ],
  "overallRationale": "<two sentences summarising strengths and weaknesses>"
}`;

const AB_SYSTEM = `You are a rigorous AI response evaluator. Compare Response A and Response B for the given prompt on five criteria. Return ONLY valid JSON with no markdown fences.

CRITERIA:
${CRITERIA_BLOCK}

REQUIRED JSON SCHEMA:
{
  "comparisons": [
    {
      "criterionId": "<id>",
      "winner": "<A|B|TIE>",
      "margin": "<CLEAR|NARROW>",
      "rationale": "<one sentence>"
    }
  ],
  "overallWinner": "<A|B|TIE>",
  "overallRationale": "<two sentences>"
}`;

// ── Public API ───────────────────────────────────────────────────────────────

export async function evaluateSingle(
  model: string,
  apiKey: string,
  prompt: string,
  response: string
): Promise<SingleEvaluationResult> {
  const userPrompt = `PROMPT:\n${prompt}\n\nAI RESPONSE:\n${response}`;
  const raw = await callGemini(model, apiKey, SINGLE_SYSTEM, userPrompt);

  // Validate shape
  const parsed = raw as {
    scores?: Array<{ criterionId: string; score: number; rationale: string }>;
    overallRationale?: string;
  };

  if (!Array.isArray(parsed.scores) || parsed.scores.length !== 5) {
    throw new Error("Unexpected response shape from Gemini (single eval).");
  }

  const scores = parsed.scores.map((s) => ({
    criterionId: s.criterionId as CriterionId,
    score: Math.min(5, Math.max(1, Math.round(s.score))) as Score,
    rationale: s.rationale,
  }));

  return {
    mode: "single",
    model,
    prompt,
    response,
    scores,
    weightedTotal: computeWeightedTotal(scores),
    overallRationale: parsed.overallRationale ?? "",
    timestamp: Date.now(),
  };
}

export async function evaluateAB(
  model: string,
  apiKey: string,
  prompt: string,
  responseA: string,
  responseB: string
): Promise<ABEvaluationResult> {
  const userPrompt = `PROMPT:\n${prompt}\n\nRESPONSE A:\n${responseA}\n\nRESPONSE B:\n${responseB}`;
  const raw = await callGemini(model, apiKey, AB_SYSTEM, userPrompt);

  const parsed = raw as {
    comparisons?: Array<{
      criterionId: string;
      winner: string;
      margin: string;
      rationale: string;
    }>;
    overallWinner?: string;
    overallRationale?: string;
  };

  if (!Array.isArray(parsed.comparisons) || parsed.comparisons.length !== 5) {
    throw new Error("Unexpected response shape from Gemini (A/B eval).");
  }

  const comparisons = parsed.comparisons.map((c) => ({
    criterionId: c.criterionId as CriterionId,
    winner: (["A", "B", "TIE"].includes(c.winner) ? c.winner : "TIE") as ABWinner,
    margin: (["CLEAR", "NARROW"].includes(c.margin) ? c.margin : "NARROW") as ABMargin,
    rationale: c.rationale,
  }));

  return {
    mode: "ab",
    model,
    prompt,
    responseA,
    responseB,
    comparisons,
    overallWinner: (["A", "B", "TIE"].includes(parsed.overallWinner ?? "")
      ? parsed.overallWinner
      : "TIE") as ABWinner,
    overallRationale: parsed.overallRationale ?? "",
    timestamp: Date.now(),
  };
}
