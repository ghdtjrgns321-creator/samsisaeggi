"use client";

// 첫 화면 하단 목록 시트. 세 단계(min ↔ peek ↔ full)를 끌어서 오간다.
//  - min(내림): 손잡이 + 제목 한 줄만. 지도를 넓게 볼 때
//  - peek(접힘, 처음 상태): "송도2동 · 점심 7곳  랭킹순▾" + 목록 1.5줄(아래가 잘려 끌어올릴 수 있다는 표시)
//  - full(펼침): [지역 랭킹 | 내 찜 N] 탭. 검색창은 가리지 않도록 그 아래까지만 펼친다.
// 손잡이·제목을 끌면 한 단계씩 오르내리고, 누르면 min·peek는 한 단계 위로, full은 peek로.
// 목록 위에서도 위로 끌면 펼치고, 맨 위에서 아래로 끌면 내린다.
import { useCallback, useEffect, useState } from "react";
import type { Place } from "@/types/place";
import type { LatLng } from "@/lib/geolocation";
import { SORT_OPTIONS, sortPlaces, type SortKey } from "@/lib/ranking";
import { fetchMyFavorites, type MyFavorite } from "@/lib/db/favorites";
import { useVerticalDrag } from "@/hooks/useVerticalDrag";
import FavoritesTab from "./FavoritesTab";
import PlaceListItem from "./PlaceListItem";

const MIN_HEIGHT = 56; // 손잡이 + 제목 한 줄
const PEEK_HEIGHT = 210; // 손잡이 + 제목 + 목록 1.5줄
const TOP_GAP = 72; // 펼쳤을 때 위에 남길 공간 (검색창)

export type ListLevel = "min" | "peek" | "full";

/** 단계별로 지도 아래쪽을 가리는 높이 (지도 홈이 보이는 범위를 계산할 때). full은 거의 다 가리므로 peek 기준 */
export function listCoverHeight(level: ListLevel): number {
  return level === "min" ? MIN_HEIGHT : PEEK_HEIGHT;
}

const LEVELS: ListLevel[] = ["min", "peek", "full"];
const step = (level: ListLevel, by: 1 | -1) =>
  LEVELS[Math.min(LEVELS.length - 1, Math.max(0, LEVELS.indexOf(level) + by))];

type Tab = "ranking" | "favorites";

type Props = {
  places: Place[]; // 지금 화면 안, 태그 조건에 맞는 리뷰 있는 장소
  allPlaces: Place[]; // 등록 장소 전체 (내 찜은 화면 밖 장소도 보여줌)
  regionName: string | null;
  filtersLabel: string; // 켜진 태그 ("" = 없음)
  myLocation: LatLng | null;
  maxHeight: number;
  onSelect: (place: Place) => void;
  onError: (msg: string) => void;
  level: ListLevel;
  onLevelChange: (level: ListLevel) => void; // 지도 홈이 들고 있음 (내 위치 버튼 숨김·보이는 범위 계산)
  onLocated: (at: LatLng) => void; // 내 찜 거리순에서 위치를 찾았을 때
  onPlacesChanged: () => void; // 내 찜에서 찜을 풀었을 때 등록 장소(찜 수) 다시 불러오기
};

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 border-b-2 py-2.5 text-[15px] font-bold ${active ? "border-primary text-ink" : "border-transparent text-gray"}`}
    >
      {children}
    </button>
  );
}

export default function PlaceListSheet({
  places,
  allPlaces,
  regionName,
  filtersLabel,
  myLocation,
  maxHeight,
  onSelect,
  onError,
  level,
  onLevelChange,
  onLocated,
  onPlacesChanged,
}: Props) {
  const expanded = level === "full";
  const [tab, setTab] = useState<Tab>("ranking");
  const [sort, setSort] = useState<SortKey>("ranking");
  const [favorites, setFavorites] = useState<MyFavorite[]>([]);
  const { dy, dragging, bind, bindScroll } = useVerticalDrag({
    onUp: () => onLevelChange(step(level, 1)),
    onDown: () => onLevelChange(step(level, -1)),
    onTap: () => onLevelChange(expanded ? "peek" : step(level, 1)),
    expanded,
  });

  // 시트가 다시 나타날 때마다(카드를 닫고 돌아올 때 등) 내 찜을 새로 읽는다
  const loadFavorites = useCallback(() => {
    fetchMyFavorites()
      .then(setFavorites)
      .catch((e: Error) => onError(e.message));
  }, [onError]);
  useEffect(loadFavorites, [loadFavorites]);

  const expandedHeight = Math.max(PEEK_HEIGHT, maxHeight - TOP_GAP);
  const base = { min: MIN_HEIGHT, peek: PEEK_HEIGHT, full: expandedHeight }[level];
  const height = Math.min(expandedHeight, Math.max(MIN_HEIGHT, base - dy));

  const favoriteCount = favorites.filter((f) => allPlaces.some((p) => p.id === f.placeId)).length;
  const showFavorites = expanded && tab === "favorites";
  const ranked = sortPlaces(places, sort, myLocation);
  const title = [regionName ?? "이 지역", filtersLabel].filter(Boolean).join(" · ");

  return (
    <section
      style={{ height }}
      className={`flex w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] ${
        dragging ? "" : "transition-[height] duration-200 ease-out"
      }`}
    >
      {/* 손잡이 = 끄는 영역 */}
      <div {...bind} className="shrink-0 touch-none pt-2 pb-2" aria-label="끌어서 펼치기">
        <div className="mx-auto h-1 w-10 rounded-full bg-line" />
      </div>

      {expanded && (
        <div role="tablist" className="flex shrink-0 border-b border-line px-5">
          <TabButton active={tab === "ranking"} onClick={() => setTab("ranking")}>
            지역 랭킹
          </TabButton>
          <TabButton active={tab === "favorites"} onClick={() => setTab("favorites")}>
            내 찜 <span className="text-primary">{favoriteCount}</span>
          </TabButton>
        </div>
      )}

      {!showFavorites && (
        <div className={`flex shrink-0 items-center gap-2 px-5 pb-2 ${expanded ? "pt-3" : ""}`}>
          {/* 제목도 끄는 영역 (정렬 선택은 제외) */}
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
      )}

      <div
        {...bindScroll}
        className={`min-h-0 flex-1 overscroll-none px-5 ${expanded && !dragging ? "overflow-y-auto" : "overflow-hidden"}`}
      >
        {showFavorites ? (
          <FavoritesTab
            favorites={favorites}
            allPlaces={allPlaces}
            myLocation={myLocation}
            onLocated={onLocated}
            onSelect={onSelect}
            onChanged={() => {
              loadFavorites();
              onPlacesChanged();
            }}
            onError={onError}
          />
        ) : ranked.length > 0 ? (
          <ul>
            {ranked.map((p, i) => (
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
