"use client";

// 첫 화면 하단 목록 시트: "송도1동 · 점심 7곳  랭킹순▾" + 지금 화면 안 리뷰 있는 장소 목록.
// 접힌 상태 = 제목 + 1.5줄(아래가 잘려 끌어올릴 수 있다는 표시). 손잡이·제목을 끌거나 누르면 펼침.
import { useState } from "react";
import type { Place } from "@/types/place";
import type { LatLng } from "@/lib/geolocation";
import { SORT_OPTIONS, sortPlaces, type SortKey } from "@/lib/ranking";
import { useVerticalDrag } from "@/hooks/useVerticalDrag";
import PlaceListItem from "./PlaceListItem";

const COLLAPSED_HEIGHT = 210; // 손잡이 + 제목 + 목록 1.5줄

type Props = {
  places: Place[]; // 지금 화면 안, 태그 조건에 맞는 리뷰 있는 장소
  regionName: string | null;
  filtersLabel: string; // 켜진 태그 ("" = 없음)
  myLocation: LatLng | null;
  maxHeight: number;
  onSelect: (place: Place) => void;
};

export default function PlaceListSheet({ places, regionName, filtersLabel, myLocation, maxHeight, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [sort, setSort] = useState<SortKey>("ranking");
  const { dy, dragging, bind } = useVerticalDrag({
    onUp: () => setExpanded(true),
    onDown: () => setExpanded(false),
    onTap: () => setExpanded((v) => !v),
  });

  const base = expanded ? maxHeight : COLLAPSED_HEIGHT;
  const height = Math.min(maxHeight, Math.max(COLLAPSED_HEIGHT, base - dy));
  const sorted = sortPlaces(places, sort, myLocation);
  const title = [regionName ?? "이 지역", filtersLabel].filter(Boolean).join(" · ");

  return (
    <section
      style={{ height }}
      className={`flex w-full flex-col overflow-hidden bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] ${
        expanded ? "" : "rounded-t-2xl"
      } ${dragging ? "" : "transition-[height] duration-200 ease-out"}`}
    >
      {/* 손잡이 + 제목 = 끄는 영역 (정렬 선택은 제외) */}
      <div {...bind} className="shrink-0 touch-none pt-2 pb-2" aria-label="끌어서 펼치기">
        <div className="mx-auto h-1 w-10 rounded-full bg-line" />
      </div>
      <div className="flex shrink-0 items-center gap-2 px-5 pb-2">
        <h2 {...bind} className="min-w-0 flex-1 touch-none truncate text-base font-bold">
          {title} <span className="text-primary">{places.length}곳</span>
        </h2>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="정렬"
          className="shrink-0 bg-transparent text-sm text-gray outline-none"
        >
          {SORT_OPTIONS.filter((o) => o.value !== "distance" || myLocation).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className={`min-h-0 flex-1 px-5 ${expanded ? "overflow-y-auto" : "overflow-hidden"}`}>
        {sorted.length > 0 ? (
          <ul>
            {sorted.map((p, i) => (
              <PlaceListItem key={p.id} place={p} rank={i + 1} myLocation={myLocation} onSelect={onSelect} />
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-gray">이 지역엔 아직 리뷰가 없어요</p>
        )}
      </div>
    </section>
  );
}
