"use client";

import Script from "next/script";
import { useRef } from "react";
import type { Place } from "@/data/places";

// Kakao Maps SDK는 공식 타입이 없어 쓰는 부분만 최소로 선언
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

const SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false`;

function pinElement(place: Place): HTMLElement {
  const el = document.createElement("div");
  el.className = `pin pin-${place.kind}`;
  el.innerHTML = `<span class="pin-label">${place.name}</span><span class="pin-tail"></span>`;
  return el;
}

export default function KakaoMap({ places }: { places: Place[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const init = () => {
    const { maps } = window.kakao;
    maps.load(() => {
      if (!containerRef.current) return;
      const map = new maps.Map(containerRef.current, {
        center: new maps.LatLng(places[0].lat, places[0].lng),
        level: 4,
      });
      const bounds = new maps.LatLngBounds();
      for (const place of places) {
        const position = new maps.LatLng(place.lat, place.lng);
        new maps.CustomOverlay({ map, position, content: pinElement(place), yAnchor: 1 });
        bounds.extend(position);
      }
      map.setBounds(bounds);

      // 창 크기가 바뀌면(회전·PC 리사이즈) 지도는 스스로 다시 그리지 않으므로 직접 갱신.
      // 사용자가 옮겨둔 위치는 유지한다.
      new ResizeObserver(() => {
        const center = map.getCenter();
        map.relayout();
        map.setCenter(center);
      }).observe(containerRef.current);
    });
  };

  return (
    <>
      {/* onReady: 스크립트가 이미 로드된 뒤 다시 마운트돼도 매번 실행 */}
      <Script src={SDK_URL} strategy="afterInteractive" onReady={init} />
      <div ref={containerRef} className="h-full w-full" />
    </>
  );
}
