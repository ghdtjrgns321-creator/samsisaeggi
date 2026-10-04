"use client";

// 내 위치 버튼: 현재 위치로 이동하고 파란 점을 표시, 찾은 위치는 onLocated로 (목록의 도보 시간). 실패하면 알림.
import { useRef, useState } from "react";
import type { KakaoMap } from "@/lib/kakao/sdk";
import { getCurrentPosition, type LatLng } from "@/lib/geolocation";
import { myLocationDotElement } from "@/lib/kakao/overlays";

type Props = { map: KakaoMap | null; onToast: (msg: string) => void; onLocated: (at: LatLng) => void };

export default function MyLocationButton({ map, onToast, onLocated }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dotRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!map) return;
    setLoading(true);
    try {
      const { lat, lng } = await getCurrentPosition();
      onLocated({ lat, lng });
      const { maps } = window.kakao;
      const position = new maps.LatLng(lat, lng);

      dotRef.current?.setMap(null);
      dotRef.current = new maps.CustomOverlay({ map, position, content: myLocationDotElement() });
      map.setLevel(4);
      map.panTo(position);
    } catch (e) {
      onToast((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
