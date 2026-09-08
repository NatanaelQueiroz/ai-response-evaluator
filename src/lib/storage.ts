import type { EvaluationResult } from "../types/evaluation";

const KEYS = {
  apiKey: "aie:api_key",
  model: "aie:model",
  history: "aie:history",
} as const;

// ── API Key ──────────────────────────────────────────────────────────────────

export function loadApiKey(): string {
  return localStorage.getItem(KEYS.apiKey) ?? "";
}

export function saveApiKey(key: string): void {
  localStorage.setItem(KEYS.apiKey, key);
}

export function clearApiKey(): void {
  localStorage.removeItem(KEYS.apiKey);
}

// ── Model preference ─────────────────────────────────────────────────────────

export function loadModel(): string | null {
  return localStorage.getItem(KEYS.model);
}

export function saveModel(model: string): void {
  localStorage.setItem(KEYS.model, model);
}

// ── Evaluation history ───────────────────────────────────────────────────────

const MAX_HISTORY = 50;

export function loadHistory(): EvaluationResult[] {
  try {
    const raw = localStorage.getItem(KEYS.history);
    if (!raw) return [];
    return JSON.parse(raw) as EvaluationResult[];
  } catch {
    return [];
  }
}

export function appendHistory(result: EvaluationResult): EvaluationResult[] {
  const history = loadHistory();
  const updated = [result, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(KEYS.history, JSON.stringify(updated));
  return updated;
}

export function clearHistory(): void {
  localStorage.removeItem(KEYS.history);
}
