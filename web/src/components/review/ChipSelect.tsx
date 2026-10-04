"use client";

// 태그 칩 고르기 (용도·시간대·작업 환경). 다시 누르면 해제
import type { FilterOption } from "@/lib/filters";

type Props = {
  options: readonly FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
};

export default function ChipSelect({ options, selected, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(o.value)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              on ? "border-primary bg-primary-soft font-bold text-primary" : "border-line"
            }`}
          >
            {o.emoji} {o.label}
          </button>
        );
      })}
    </div>
  );
}
