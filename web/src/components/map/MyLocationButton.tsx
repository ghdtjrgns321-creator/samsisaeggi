"use client";

// 내 위치 버튼: 현재 위치로 이동하고 파란 점을 표시. 실패하면 이유를 잠깐 보여준다.
import { useRef, useState } from "react";
import type { KakaoMap } from "@/lib/kakao/sdk";
import { getCurrentPosition } from "@/lib/geolocation";
import { myLocationDotElement } from "@/lib/kakao/overlays";

export default function MyLocationButton({ map }: { map: KakaoMap | null }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dotRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!map) return;
    setLoading(true);
    setError(null);
    try {
      const { lat, lng } = await getCurrentPosition();
      const { maps } = window.kakao;
      const position = new maps.LatLng(lat, lng);

      dotRef.current?.setMap(null);
      dotRef.current = new maps.CustomOverlay({ map, position, content: myLocationDotElement() });
      map.setLevel(4);
      map.panTo(position);
    } catch (e) {
      setError((e as Error).message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute right-4 bottom-6 z-10 flex flex-col items-end gap-2">
      {error && (
        <p className="max-w-60 rounded-lg bg-ink px-3 py-2 text-xs text-white shadow">{error}</p>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={!map || loading}
        aria-label="내 위치로 이동"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md disabled:opacity-50"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--location)" strokeWidth="2">
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="3" fill="var(--location)" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      </button>
    </div>
  );
}
