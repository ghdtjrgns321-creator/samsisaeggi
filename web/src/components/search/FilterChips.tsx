// 검색창 아래 빠른 태그 줄 (옆으로 넘김). 같은 묶음 안에서는 하나만, 다시 누르면 꺼짐.
import { Fragment } from "react";
import { FILTER_GROUPS, type FilterOption, type Filters } from "@/lib/filters";

function Chip({ option, active, onClick }: { option: FilterOption; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-[7px] text-[13px] font-medium whitespace-nowrap shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${
        active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"
      }`}
    >
      <span aria-hidden>{option.emoji}</span>
      {option.label}
    </button>
  );
}

type Props = { filters: Filters; onChange: (next: Filters) => void };

export default function FilterChips({ filters, onChange }: Props) {
  return (
    <div className="absolute inset-x-0 top-[72px] z-[5] flex items-center gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {FILTER_GROUPS.map(({ key, options }, groupIndex) => (
        <Fragment key={key}>
          {groupIndex > 0 && <span className="w-1.5 shrink-0" aria-hidden />}
          {options.map((option) => (
            <Chip
              key={option.value}
              option={option}
              active={filters[key] === option.value}
              onClick={() => onChange({ ...filters, [key]: filters[key] === option.value ? null : option.value })}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
}
