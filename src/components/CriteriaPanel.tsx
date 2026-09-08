import { useState, useRef, useCallback } from "react";
import { RUBRIC } from "../lib/rubric";
import type { ScoreDescriptor } from "../lib/rubric";

interface CriteriaPanelProps {
  activeCriterionId?: string;
}

interface TooltipState {
  descriptor: ScoreDescriptor;
  x: number;
  y: number;
}

const TOOLTIP_WIDTH = 176; // w-44
const TOOLTIP_OFFSET = 10; // gap above the bar

export function CriteriaPanel({ activeCriterionId }: CriteriaPanelProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, descriptor: ScoreDescriptor) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();

      // Centre horizontally on the bar, then clamp inside viewport
      let x = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
      x = Math.max(8, Math.min(x, window.innerWidth - TOOLTIP_WIDTH - 8));

      // Place above the bar; if not enough room, place below
      const spaceAbove = rect.top;
      const y =
        spaceAbove > 80
          ? rect.top - TOOLTIP_OFFSET
          : rect.bottom + TOOLTIP_OFFSET;

      setTooltip({ descriptor, x, y });
    },
    []
  );

  const hideTooltip = useCallback(() => {
    hideTimer.current = setTimeout(() => setTooltip(null), 80);
  }, []);

  return (
    <>
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
                <p className="text-xs text-gray-500 mb-2">
                  {criterion.description}
                </p>
                <div className="flex gap-1">
                  {criterion.descriptors.map((d) => (
                    <div
                      key={d.score}
                      className="flex-1 cursor-help"
                      onMouseEnter={(e) => showTooltip(e, d)}
                      onMouseLeave={hideTooltip}
                    >
                      <div className="h-1.5 rounded-full bg-gray-200 hover:bg-blue-300 transition-colors" />
                      <span className="text-center block text-xs text-gray-400 mt-0.5">
                        {d.score}
                      </span>
                    </div>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Fixed tooltip — renders outside any clipping container */}
      {tooltip && (
        <div
          className="fixed z-50 w-44 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform:
              tooltip.y < (tooltip.descriptor.score > 1 ? 80 : 0)
                ? "translateY(0)"
                : "translateY(-100%)",
          }}
        >
          <span className="font-semibold">{tooltip.descriptor.score} — {tooltip.descriptor.label}</span>
          <p className="mt-1 text-gray-300 leading-snug">
            {tooltip.descriptor.description}
          </p>
        </div>
      )}
    </>
  );
}
