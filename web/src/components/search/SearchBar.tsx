"use client";

// 상단 검색창: 입력하면 잠시 뒤 자동 검색 → 정렬 → 결과 목록. 고른 결과는 onSelect로 넘긴다.
// 검색창 밖을 누르면 목록을 닫고, 다시 입력창을 누르면 직전 결과를 다시 연다.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Place } from "@/data/places";
import type { KakaoMap } from "@/lib/kakao/sdk";
import { searchPlaces } from "@/lib/kakao/placeSearch";
import { rankResults, type SearchResult } from "@/lib/search/rankResults";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useClickOutside } from "@/hooks/useClickOutside";
import SearchResultList from "./SearchResultList";

const SEARCH_DELAY_MS = 300;

type Props = {
  map: KakaoMap | null;
  registered: Place[];
  onSelect: (result: SearchResult) => void;
};

export default function SearchBar({ map, registered, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState("");
  // query: 이 결과를 만든 검색어 ("" = 아직 결과 없음)
  const [results, setResults] = useState<{ query: string; items: SearchResult[] }>({ query: "", items: [] });
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const query = useDebouncedValue(keyword.trim(), SEARCH_DELAY_MS);

  useEffect(() => {
    if (!map || !query) return;
    let stale = false; // 늦게 도착한 이전 검색 응답은 버린다
    searchPlaces(query, map)
      .then((found) => {
        if (stale) return;
        setResults({ query, items: rankResults(found, registered) });
        setError(null);
      })
      .catch((err: Error) => {
        if (!stale) setError(err.message);
      });
    return () => {
      stale = true;
    };
  }, [query, map, registered]);

  // 지도는 터치를 가로채 입력창 포커스를 안 풀어주므로 직접 blur (휴대폰 키보드도 내려감)
  const close = useCallback(() => {
    setOpen(false);
    inputRef.current?.blur();
  }, []);
  useClickOutside(containerRef, close);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    inputRef.current?.blur();
    onSelect(result);
  };

  const clear = () => {
    setKeyword("");
    setResults({ query: "", items: [] });
    setError(null);
    inputRef.current?.focus();
  };

  // 입력 중에는 새 결과가 올 때까지 직전 결과를 유지해 목록이 깜빡이지 않게 한다
  const showList = open && keyword.trim() !== "" && results.query !== "";

  return (
    <div ref={containerRef} className="absolute inset-x-4 top-4 z-10 overflow-hidden rounded-2xl bg-white shadow-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          inputRef.current?.blur(); // 휴대폰 키보드 내리기 (목록은 유지)
        }}
        className="flex h-13 items-center gap-3 px-4"
      >
        <span className="shrink-0 font-bold text-primary">삼시세끼</span>
        <span className="h-4 w-px shrink-0 bg-line" />
        <input
          ref={inputRef}
          type="search"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="식당 · 지역 · 고객사 검색"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray [&::-webkit-search-cancel-button]:hidden"
        />
        {keyword && (
          <button type="button" onClick={clear} aria-label="검색어 지우기" className="text-gray">
            ✕
          </button>
        )}
        <button type="submit" aria-label="검색" disabled={!map}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
        </button>
      </form>
      {open && error && <p className="border-t border-line px-4 py-3 text-sm text-primary">{error}</p>}
      {showList && !error && (
        <div className="border-t border-line">
          <SearchResultList results={results.items} onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}
