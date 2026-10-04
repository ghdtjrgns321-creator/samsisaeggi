// 검색창 아래 필터 줄 (옆으로 넘김). 종류 칩 + 종류에 맞는 리뷰 태그 묶음마다 칩 하나, 누르면 아래로 펼쳐 하나를 고른다.
// 펼친 목록은 넘김 줄 밖에 띄운다 — 줄 안에 두면 overflow에 잘린다.
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { KIND_GROUP, tagGroupsFor, withKind, type FilterGroup, type FilterKey, type FilterOption, type Filters } from "@/lib/filters";

type Open = { key: FilterKey; left: number };

const PANEL_WIDTH = 132;
export const MAP_TOP_COVER_PX = 112; // 검색창 + 필터 칩이 가리는 지도 위쪽 높이 (칩 top-[72px] + 칩 줄 높이)

function GroupChip({ group, value, open, onClick }: { group: FilterGroup; value: string | null; open: boolean; onClick: (e: MouseEvent<HTMLButtonElement>) => void }) {
  const picked = group.options.find((o) => o.value === value);
  const shown = picked ?? group;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="listbox"
      aria-expanded={open}
      className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-[7px] text-[13px] font-medium whitespace-nowrap shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${
        picked ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"
      }`}
    >
      <span aria-hidden>{shown.emoji}</span>
      {shown.label}
      <span aria-hidden className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>
        ▾
      </span>
    </button>
  );
}

function OptionRow({ option, active, onClick }: { option: Pick<FilterOption, "label" | "emoji">; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] whitespace-nowrap ${
        active ? "font-semibold text-primary" : "text-ink"
      }`}
    >
      <span aria-hidden>{option.emoji}</span>
      {option.label}
    </button>
  );
}

type Props = { filters: Filters; onChange: (next: Filters) => void };

export default function FilterChips({ filters, onChange }: Props) {
  const [open, setOpen] = useState<Open | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // 바깥(지도 등)을 누르면 펼친 목록을 닫는다
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const toggle = (key: FilterKey, chip: HTMLElement) => {
    const root = rootRef.current?.getBoundingClientRect();
    if (!root) return;
    // 오른쪽 끝 칩이면 화면 밖으로 나가지 않게 당긴다
    const left = Math.min(chip.getBoundingClientRect().left - root.left, root.width - PANEL_WIDTH - 16);
    setOpen(open?.key === key ? null : { key, left });
  };

  const pick = (key: FilterKey, value: string | null) => {
    setOpen(null);
    onChange(key === "kind" ? withKind(filters, value) : { ...filters, [key]: value });
  };

  const groups = [KIND_GROUP, ...tagGroupsFor(filters.kind)];
  const openGroup = open && groups.find((g) => g.key === open.key);

  return (
    <div ref={rootRef} className="absolute inset-x-0 top-[72px] z-[5]">
      {/* 줄을 넘기면 칩 위치가 바뀌므로 펼친 목록을 닫는다 */}
      <div onScroll={() => setOpen(null)} className="flex items-center gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {groups.map((group) => (
          <GroupChip
            key={group.key}
            group={group}
            value={filters[group.key]}
            open={open?.key === group.key}
            onClick={(e) => toggle(group.key, e.currentTarget)}
          />
        ))}
      </div>
      {open && openGroup && (
        <div
          role="listbox"
          style={{ left: open.left }}
          className="absolute top-full mt-1 w-[132px] overflow-hidden rounded-xl border border-line bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
        >
          <OptionRow option={{ label: "전체", emoji: "✨" }} active={filters[open.key] === null} onClick={() => pick(open.key, null)} />
          {openGroup.options.map((option) => (
            <OptionRow key={option.value} option={option} active={filters[open.key] === option.value} onClick={() => pick(open.key, option.value)} />
          ))}
        </div>
      )}
    </div>
  );
}
