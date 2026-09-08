import type { EvaluationMode } from "../types/evaluation";

interface ModeToggleProps {
  mode: EvaluationMode;
  onChange: (mode: EvaluationMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1 gap-1">
      <button
        type="button"
        onClick={() => onChange("single")}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          mode === "single"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Single
      </button>
      <button
        type="button"
        onClick={() => onChange("ab")}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          mode === "ab"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        A/B Compare
      </button>
    </div>
  );
}
