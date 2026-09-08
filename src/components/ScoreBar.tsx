interface ScoreBarProps {
  score: number; // 1–5
  max?: number;
}

const COLOR_MAP: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-blue-500",
  5: "bg-green-500",
};

export function ScoreBar({ score, max = 5 }: ScoreBarProps) {
  const pct = (score / max) * 100;
  const color = COLOR_MAP[Math.round(score)] ?? "bg-blue-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-6 text-right">
        {score}
      </span>
    </div>
  );
}
