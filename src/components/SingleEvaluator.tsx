import { useState } from "react";
import { ResponseInput } from "./ResponseInput";
import { SingleResultCard } from "./ResultCard";
import type { SingleEvaluationResult } from "../types/evaluation";

interface SingleEvaluatorProps {
  model: string;
  apiKey: string;
  status: "idle" | "loading" | "success" | "error";
  generateStatus: "idle" | "loading" | "error";
  generateError: string | null;
  error: string | null;
  result: SingleEvaluationResult | null;
  onEvaluate: (prompt: string, response: string) => void;
  onGenerate: (prompt: string) => Promise<string | null>;
  onReset: () => void;
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

export function SingleEvaluator({
  model,
  apiKey,
  status,
  generateStatus,
  generateError,
  error,
  result,
  onEvaluate,
  onGenerate,
  onReset,
}: SingleEvaluatorProps) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const isEvaluating = status === "loading";
  const isGenerating = generateStatus === "loading";
  const isBusy = isEvaluating || isGenerating;

  function handleEvaluate() {
    if (!prompt.trim() || !response.trim()) return;
    onEvaluate(prompt, response);
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    const generated = await onGenerate(prompt);
    if (generated) setResponse(generated);
  }

  async function handleGenerateAndEvaluate() {
    if (!prompt.trim()) return;
    const generated = await onGenerate(prompt);
    if (generated) {
      setResponse(generated);
      onEvaluate(prompt, generated);
    }
  }

  function handleReset() {
    setPrompt("");
    setResponse("");
    onReset();
  }

  return (
    <div className="space-y-4">
      <ResponseInput
        label="Prompt"
        placeholder="The prompt / question that was given to the AI…"
        value={prompt}
        onChange={setPrompt}
        disabled={isBusy}
        rows={3}
      />

      {/* Response field + Generate button */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">AI Response</label>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isBusy || !prompt.trim() || !apiKey}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {isGenerating ? (
              <>
                <Spinner />
                Generating…
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Generate response
              </>
            )}
          </button>
        </div>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          disabled={isBusy}
          rows={7}
          placeholder="Paste an AI response to evaluate, or click 'Generate response' above…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      {/* Generate error */}
      {generateStatus === "error" && generateError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="font-medium">Generate error: </span>
          {generateError}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleEvaluate}
          disabled={isBusy || !prompt.trim() || !response.trim() || !apiKey}
          className="flex-1 min-w-32 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {isEvaluating ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Evaluating…
            </span>
          ) : (
            "Evaluate"
          )}
        </button>

        <button
          type="button"
          onClick={handleGenerateAndEvaluate}
          disabled={isBusy || !prompt.trim() || !apiKey}
          title="Generate a response and immediately evaluate it"
          className="flex-1 min-w-40 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors"
        >
          {isBusy && !isEvaluating ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Generating…
            </span>
          ) : isEvaluating ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Evaluating…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Generate &amp; Evaluate
            </span>
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

      {/* Evaluate error */}
      {status === "error" && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="font-medium">Error: </span>
          {error}
        </div>
      )}

      {status === "success" && result && <SingleResultCard result={result} />}

      {model && !apiKey && (
        <p className="text-xs text-amber-600">
          ⚠ No API key configured. Please set your key above.
        </p>
      )}
    </div>
  );
}
