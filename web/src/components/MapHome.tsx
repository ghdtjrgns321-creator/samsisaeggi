"use client";

// 지도 홈 화면: 지도 + 상단 검색창 + 내 위치 버튼을 조립만 한다.
import { useState } from "react";
import type { Place } from "@/data/places";
import type { KakaoMap as KakaoMapInstance } from "@/lib/kakao/sdk";
import KakaoMap from "./map/KakaoMap";
import MyLocationButton from "./map/MyLocationButton";
import { usePlacePins } from "./map/usePlacePins";
import { useSearchPin } from "./map/useSearchPin";
import SearchBar from "./search/SearchBar";

export default function MapHome({ places }: { places: Place[] }) {
  const [map, setMap] = useState<KakaoMapInstance | null>(null);
  usePlacePins(map, places);
  const moveToResult = useSearchPin(map);

  return (
    <main className="relative h-dvh">
      <KakaoMap initialCenter={places[0]} onReady={setMap} />
      <SearchBar map={map} registered={places} onSelect={moveToResult} />
      <MyLocationButton map={map} />
    </main>
  );
}
