import { useState } from "react";
import { ResponseInput } from "./ResponseInput";
import { ABResultCard } from "./ResultCard";
import type { ABEvaluationResult } from "../types/evaluation";

interface ABComparatorProps {
  model: string;
  apiKey: string;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  result: ABEvaluationResult | null;
  onEvaluate: (prompt: string, responseA: string, responseB: string) => void;
  onReset: () => void;
}

export function ABComparator({
  model,
  apiKey,
  status,
  error,
  result,
  onEvaluate,
  onReset,
}: ABComparatorProps) {
  const [prompt, setPrompt] = useState("");
  const [responseA, setResponseA] = useState("");
  const [responseB, setResponseB] = useState("");

  const isLoading = status === "loading";

  function handleSubmit() {
    if (!prompt.trim() || !responseA.trim() || !responseB.trim()) return;
    onEvaluate(prompt, responseA, responseB);
  }

  function handleReset() {
    setPrompt("");
    setResponseA("");
    setResponseB("");
    onReset();
  }

  return (
    <div className="space-y-4">
      <ResponseInput
        label="Prompt"
        placeholder="The prompt / question given to both AI models…"
        value={prompt}
        onChange={setPrompt}
        disabled={isLoading}
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResponseInput
          label="Response A"
          placeholder="Paste Response A…"
          value={responseA}
          onChange={setResponseA}
          disabled={isLoading}
          rows={8}
        />
        <ResponseInput
          label="Response B"
          placeholder="Paste Response B…"
          value={responseB}
          onChange={setResponseB}
          disabled={isLoading}
          rows={8}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            !prompt.trim() ||
            !responseA.trim() ||
            !responseB.trim() ||
            !apiKey
          }
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Comparing…
            </span>
          ) : (
            "Compare A vs B"
          )}
        </button>

        {(status === "success" || status === "error") && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {status === "error" && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="font-medium">Error: </span>
          {error}
        </div>
      )}

      {status === "success" && result && <ABResultCard result={result} />}

      {model && !apiKey && (
        <p className="text-xs text-amber-600">
          ⚠ No API key configured. Please set your key above.
        </p>
      )}
    </div>
  );
}
