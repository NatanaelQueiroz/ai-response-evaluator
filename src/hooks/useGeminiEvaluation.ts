import { useState, useCallback } from "react";
import {
  evaluateSingle,
  evaluateAB,
  GeminiApiError,
} from "../lib/gemini";
import { appendHistory } from "../lib/storage";
import type {
  SingleEvaluationResult,
  ABEvaluationResult,
} from "../types/evaluation";

type Status = "idle" | "loading" | "success" | "error";

interface UseGeminiEvaluation {
  status: Status;
  error: string | null;
  singleResult: SingleEvaluationResult | null;
  abResult: ABEvaluationResult | null;
  runSingle: (
    model: string,
    apiKey: string,
    prompt: string,
    response: string
  ) => Promise<void>;
  runAB: (
    model: string,
    apiKey: string,
    prompt: string,
    responseA: string,
    responseB: string
  ) => Promise<void>;
  reset: () => void;
}

function formatError(err: unknown): string {
  if (err instanceof GeminiApiError) {
    if (err.status === 400) return `Bad request: ${err.message}`;
    if (err.status === 401 || err.status === 403)
      return "Invalid or unauthorised API key. Please check your key.";
    if (err.status === 429)
      return "Rate limit reached. Please wait a moment and try again.";
    if (err.status >= 500)
      return "Gemini API is currently unavailable. Please try again later.";
    return `API error (${err.status}): ${err.message}`;
  }
  if (err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("network"))) {
    return "Network error. Please check your internet connection.";
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred.";
}

export function useGeminiEvaluation(): UseGeminiEvaluation {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<SingleEvaluationResult | null>(null);
  const [abResult, setAbResult] = useState<ABEvaluationResult | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setSingleResult(null);
    setAbResult(null);
  }, []);

  const runSingle = useCallback(
    async (model: string, apiKey: string, prompt: string, response: string) => {
      setStatus("loading");
      setError(null);
      setSingleResult(null);
      try {
        const result = await evaluateSingle(model, apiKey, prompt, response);
        appendHistory(result);
        setSingleResult(result);
        setStatus("success");
      } catch (err) {
        setError(formatError(err));
        setStatus("error");
      }
    },
    []
  );

  const runAB = useCallback(
    async (
      model: string,
      apiKey: string,
      prompt: string,
      responseA: string,
      responseB: string
    ) => {
      setStatus("loading");
      setError(null);
      setAbResult(null);
      try {
        const result = await evaluateAB(
          model,
          apiKey,
          prompt,
          responseA,
          responseB
        );
        appendHistory(result);
        setAbResult(result);
        setStatus("success");
      } catch (err) {
        setError(formatError(err));
        setStatus("error");
      }
    },
    []
  );

  return { status, error, singleResult, abResult, runSingle, runAB, reset };
}
