// 검색 결과 목록 (화면 표시만). 지역은 📍로 맨 위에, 그 아래 장소. 등록 장소는 "삼시세끼 리뷰 N" 표시.
import type { PlaceSummary } from "@/types/place";
import type { RegionResult } from "@/lib/kakao/regionSearch";

type Props = {
  regions?: RegionResult[]; // 검색창에서만 (근처 목록은 장소만)
  results: PlaceSummary[];
  onSelect: (result: PlaceSummary) => void;
  onSelectRegion?: (region: RegionResult) => void;
};

export default function SearchResultList({ regions = [], results, onSelect, onSelectRegion }: Props) {
  if (regions.length === 0 && results.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-gray">검색 결과가 없어요</p>;
  }

  return (
    <ul className="max-h-[60dvh] overflow-y-auto">
      {regions.map((r) => (
        <li key={r.id} className="border-t border-line first:border-t-0">
          <button
            type="button"
            onClick={() => onSelectRegion?.(r)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-surface"
          >
            <span aria-hidden>📍</span>
            <span className="truncate text-sm font-bold">{r.name}</span>
            <span className="truncate text-xs text-gray">{r.address}</span>
          </button>
        </li>
      ))}
      {results.map((r) => (
        <li key={r.id} className="border-t border-line first:border-t-0">
          <button
            type="button"
            onClick={() => onSelect(r)}
            className="w-full px-4 py-3 text-left hover:bg-surface"
          >
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-bold">{r.name}</span>
              {r.reviewCount !== null && (
                <span className="shrink-0 rounded bg-primary-soft px-1.5 py-0.5 text-[11px] font-bold text-primary">
                  삼시세끼 리뷰 {r.reviewCount}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-gray">
              {r.category} · {r.address}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}
