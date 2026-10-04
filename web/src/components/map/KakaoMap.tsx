"use client";

// 지도 생성만 담당. 만들어진 지도 객체는 onReady로 부모에게 넘긴다.
import Script from "next/script";
import { useRef } from "react";
import { KAKAO_SDK_URL, type KakaoMap as KakaoMapInstance } from "@/lib/kakao/sdk";
import type { LatLng } from "@/lib/geolocation";

type Props = {
  initialCenter: LatLng;
  onReady: (map: KakaoMapInstance) => void;
};

export default function KakaoMap({ initialCenter, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const init = () => {
    const { maps } = window.kakao;
    maps.load(() => {
      const container = containerRef.current;
      if (!container) return;
      const map = new maps.Map(container, {
        center: new maps.LatLng(initialCenter.lat, initialCenter.lng),
        level: 4,
      });

      // 창 크기가 바뀌면(회전·PC 리사이즈) 지도는 스스로 다시 그리지 않으므로 직접 갱신.
      // 사용자가 옮겨둔 위치는 유지한다.
      new ResizeObserver(() => {
        const center = map.getCenter();
        map.relayout();
        map.setCenter(center);
      }).observe(container);

      onReady(map);
    });
  };

  return (
    <>
      {/* onReady: 스크립트가 이미 로드된 뒤 다시 마운트돼도 매번 실행 */}
      <Script src={KAKAO_SDK_URL} strategy="afterInteractive" onReady={init} />
      <div ref={containerRef} className="h-full w-full" />
    </>
  );
}
