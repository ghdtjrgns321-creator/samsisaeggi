"use client";

// 지도 빈 곳을 눌렀을 때 그 좌표로 실행 (핀 클릭은 제외: 핀은 clickable 오버레이)
import { useEffect, useRef } from "react";
import type { KakaoMap } from "@/lib/kakao/sdk";

export function useMapClick(map: KakaoMap | null, onClick: (lat: number, lng: number) => void) {
  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!map) return;
    const { event } = window.kakao.maps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => onClickRef.current(e.latLng.getLat(), e.latLng.getLng());
    event.addListener(map, "click", handler);
    return () => event.removeListener(map, "click", handler);
  }, [map]);
}
