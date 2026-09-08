import { useState } from "react";
import { useApiKey } from "./hooks/useApiKey";
import { useGeminiEvaluation } from "./hooks/useGeminiEvaluation";
import { loadModel, saveModel } from "./lib/storage";
import { DEFAULT_MODEL } from "./config/models";
import type { EvaluationMode } from "./types/evaluation";

import { ApiKeySetup } from "./components/ApiKeySetup";
import { ModeToggle } from "./components/ModeToggle";
import { ModelSelector } from "./components/ModelSelector";
import { CriteriaPanel } from "./components/CriteriaPanel";
import { SingleEvaluator } from "./components/SingleEvaluator";
import { ABComparator } from "./components/ABComparator";

export default function App() {
  const { apiKey, isConfigured, save: saveApiKey, clear: clearApiKey } = useApiKey();
  const [mode, setMode] = useState<EvaluationMode>("single");
  const [model, setModel] = useState<string>(() => loadModel() ?? DEFAULT_MODEL);
  const [showKeyField, setShowKeyField] = useState(false);

  const {
    status,
    error,
    singleResult,
    abResult,
    runSingle,
    runAB,
    reset,
  } = useGeminiEvaluation();

  function handleModelChange(m: string) {
    setModel(m);
    saveModel(m);
  }

  function handleModeChange(m: EvaluationMode) {
    setMode(m);
    reset();
  }

  if (!isConfigured) {
    return <ApiKeySetup onSave={saveApiKey} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-base font-semibold text-gray-900">
            AI Response Evaluator
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <ModeToggle mode={mode} onChange={handleModeChange} />
            <ModelSelector value={model} onChange={handleModelChange} />
            <button
              type="button"
              onClick={() => setShowKeyField((v) => !v)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              API Key
            </button>
          </div>
        </div>

        {showKeyField && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <span className="text-xs text-gray-500">Key stored in localStorage:</span>
              <span className="text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded px-2 py-0.5">
                {apiKey.slice(0, 6)}{"•".repeat(Math.max(0, apiKey.length - 6))}
              </span>
              <button
                type="button"
                onClick={() => {
                  clearApiKey();
                  setShowKeyField(false);
                }}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Remove key
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Left — evaluator */}
          <div>
            {mode === "single" ? (
              <SingleEvaluator
                model={model}
                apiKey={apiKey}
                status={status}
                error={error}
                result={singleResult}
                onEvaluate={(prompt, response) =>
                  runSingle(model, apiKey, prompt, response)
                }
                onReset={reset}
              />
            ) : (
              <ABComparator
                model={model}
                apiKey={apiKey}
                status={status}
                error={error}
                result={abResult}
                onEvaluate={(prompt, a, b) =>
                  runAB(model, apiKey, prompt, a, b)
                }
                onReset={reset}
              />
            )}
          </div>

          {/* Right — rubric panel */}
          <aside className="lg:sticky lg:top-20">
            <CriteriaPanel />
          </aside>
        </div>
      </main>
    </div>
  );
}
