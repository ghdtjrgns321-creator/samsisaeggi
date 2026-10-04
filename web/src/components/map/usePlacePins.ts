"use client";

// 삼시세끼 등록 장소들을 지도에 핀으로 올리고, 처음 한 번 전체가 보이게 맞춘다.
import { useEffect } from "react";
import type { Place } from "@/data/places";
import type { KakaoMap } from "@/lib/kakao/sdk";
import { placePinElement } from "@/lib/kakao/overlays";

export function usePlacePins(map: KakaoMap | null, places: Place[]) {
  useEffect(() => {
    if (!map || places.length === 0) return;
    const { maps } = window.kakao;

    const bounds = new maps.LatLngBounds();
    const overlays = places.map((place) => {
      const position = new maps.LatLng(place.lat, place.lng);
      bounds.extend(position);
      return new maps.CustomOverlay({ map, position, content: placePinElement(place), yAnchor: 1 });
    });
    map.setBounds(bounds);

    return () => overlays.forEach((o) => o.setMap(null));
  }, [map, places]);
}
