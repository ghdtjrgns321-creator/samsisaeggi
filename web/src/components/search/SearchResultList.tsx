// 검색 결과 목록 (화면 표시만). 등록 장소는 "삼시세끼 리뷰 N" 표시.
import type { PlaceSummary } from "@/types/place";

type Props = {
  results: PlaceSummary[];
  onSelect: (result: PlaceSummary) => void;
};

export default function SearchResultList({ results, onSelect }: Props) {
  if (results.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-gray">검색 결과가 없어요</p>;
  }

  return (
    <ul className="max-h-[60dvh] overflow-y-auto">
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
