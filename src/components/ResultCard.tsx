import type {
  SingleEvaluationResult,
  ABEvaluationResult,
  ABWinner,
} from "../types/evaluation";
import { getCriterion } from "../lib/rubric";
import { ScoreBar } from "./ScoreBar";

// ── Shared ───────────────────────────────────────────────────────────────────

function Timestamp({ ts }: { ts: number }) {
  return (
    <span className="text-xs text-gray-400">
      {new Date(ts).toLocaleString()}
    </span>
  );
}

function ModelBadge({ model }: { model: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
      {model}
    </span>
  );
}

// ── Single result card ────────────────────────────────────────────────────────

function TotalScore({ value }: { value: number }) {
  const color =
    value >= 80
      ? "text-green-600"
      : value >= 55
        ? "text-blue-600"
        : value >= 35
          ? "text-yellow-600"
          : "text-red-600";

  return (
    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 border-gray-100 shrink-0">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-gray-400">/100</span>
    </div>
  );
}

interface SingleResultCardProps {
  result: SingleEvaluationResult;
}

export function SingleResultCard({ result }: SingleResultCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">
            Evaluation Result
          </span>
          <ModelBadge model={result.model} />
        </div>
        <Timestamp ts={result.timestamp} />
      </div>

      <div className="px-5 py-4 flex items-start gap-5">
        <TotalScore value={result.weightedTotal} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 leading-relaxed">
            {result.overallRationale}
          </p>
        </div>
      </div>

      <div className="px-5 pb-4 space-y-3">
        {result.scores.map((s) => {
          const criterion = getCriterion(s.criterionId);
          return (
            <div key={s.criterionId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {criterion.label}
                </span>
                <span className="text-xs text-gray-400">
                  weight {Math.round(criterion.weight * 100)}%
                </span>
              </div>
              <ScoreBar score={s.score} />
              <p className="mt-1 text-xs text-gray-500">{s.rationale}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── A/B result card ───────────────────────────────────────────────────────────

const WINNER_STYLES: Record<ABWinner, string> = {
  A: "bg-blue-50 text-blue-700 border-blue-200",
  B: "bg-purple-50 text-purple-700 border-purple-200",
  TIE: "bg-gray-50 text-gray-700 border-gray-200",
};

const WINNER_LABEL: Record<ABWinner, string> = {
  A: "Winner: A",
  B: "Winner: B",
  TIE: "Tie",
};

interface ABResultCardProps {
  result: ABEvaluationResult;
}

export function ABResultCard({ result }: ABResultCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">
            A/B Comparison Result
          </span>
          <ModelBadge model={result.model} />
        </div>
        <Timestamp ts={result.timestamp} />
      </div>

      {/* Overall winner */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-3">
        <div
          className={`shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${WINNER_STYLES[result.overallWinner]}`}
        >
          {WINNER_LABEL[result.overallWinner]}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {result.overallRationale}
        </p>
      </div>

      {/* Per-criterion */}
      <div className="px-5 py-4 space-y-4">
        {result.comparisons.map((c) => {
          const criterion = getCriterion(c.criterionId);
          return (
            <div key={c.criterionId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {criterion.label}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border ${WINNER_STYLES[c.winner]}`}
                  >
                    {c.winner === "TIE" ? "Tie" : c.winner === "A" ? "A wins" : "B wins"}
                  </span>
                  <span
                    className={`text-xs font-medium ${c.margin === "CLEAR" ? "text-gray-700" : "text-gray-400"}`}
                  >
                    {c.margin}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500">{c.rationale}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
