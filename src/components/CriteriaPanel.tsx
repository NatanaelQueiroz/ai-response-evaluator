import { RUBRIC } from "../lib/rubric";

interface CriteriaPanelProps {
  /** If provided, highlights the active criterion */
  activeCriterionId?: string;
}

export function CriteriaPanel({ activeCriterionId }: CriteriaPanelProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">
          Evaluation Rubric
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          5 criteria · scores 1–5 · weighted total 0–100
        </p>
      </div>
      <ul className="divide-y divide-gray-100">
        {RUBRIC.map((criterion) => {
          const isActive = criterion.id === activeCriterionId;
          return (
            <li
              key={criterion.id}
              className={`px-4 py-3 transition-colors ${isActive ? "bg-blue-50" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800">
                  {criterion.label}
                </span>
                <span className="text-xs text-gray-400">
                  {Math.round(criterion.weight * 100)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{criterion.description}</p>
              <div className="flex gap-1">
                {criterion.descriptors.map((d) => (
                  <div
                    key={d.score}
                    title={`${d.score}: ${d.label} — ${d.description}`}
                    className="group relative flex-1"
                  >
                    <div className="h-1.5 rounded-full bg-gray-200 group-hover:bg-blue-300 transition-colors cursor-help" />
                    <span className="text-center block text-xs text-gray-400 mt-0.5">
                      {d.score}
                    </span>
                    {/* Tooltip */}
                    <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-40 bg-gray-900 text-white text-xs rounded-lg px-2 py-1.5 shadow-lg pointer-events-none">
                      <span className="font-medium">{d.label}</span>
                      <br />
                      {d.description}
                    </div>
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
