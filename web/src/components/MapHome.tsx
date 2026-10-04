"use client";

// 지도 홈 화면: 지도 + 상단 검색창 + 하단(내 위치 버튼·장소 카드·근처 목록)을 조립하고, 선택 상태를 관리.
import { useCallback, useRef, useState } from "react";
import type { Place } from "@/data/places";
import type { PlaceSummary } from "@/types/place";
import type { KakaoMap as KakaoMapInstance } from "@/lib/kakao/sdk";
import { fitToPlaces, focusOn, panIntoView } from "@/lib/kakao/mapView";
import { getLinkedPlaceId } from "@/lib/deepLink";
import KakaoMap from "./map/KakaoMap";
import { useAreaSearch } from "./map/useAreaSearch";
import MyLocationButton from "./map/MyLocationButton";
import { usePlacePins } from "./map/usePlacePins";
import { useResultPins } from "./map/useResultPins";
import { useSearchPin } from "./map/useSearchPin";
import { useTapToPick } from "./map/useTapToPick";
import NearbyList from "./place/NearbyList";
import PlaceSheet from "./place/PlaceSheet";
import SearchBar from "./search/SearchBar";
import Toast from "./Toast";
import { useElementHeight } from "@/hooks/useElementHeight";

const TOAST_MS = 2000;

export default function MapHome({ places }: { places: Place[] }) {
  const mainRef = useRef<HTMLElement>(null);
  const mainHeight = useElementHeight(mainRef); // 장소 시트를 펼쳤을 때 높이
  const [map, setMap] = useState<KakaoMapInstance | null>(null);
  const [selected, setSelected] = useState<PlaceSummary | null>(null);
  const [candidates, setCandidates] = useState<PlaceSummary[] | null>(null);
  const [areaKeyword, setAreaKeyword] = useState<string | null>(null); // 엔터 검색어 (null = 검색 안 함)
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimerRef.current); // 새 알림이 이전 알림 타이머에 일찍 지워지지 않게
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const handleMapReady = (m: KakaoMapInstance) => {
    setMap(m);
    // 공유 링크로 들어왔으면 그 장소를 바로 열고, 아니면 등록 장소 전체가 보이게
    const linked = places.find((p) => p.id === getLinkedPlaceId());
    if (linked) {
      setSelected(linked);
      focusOn(m, linked.lat, linked.lng);
    } else {
      fitToPlaces(m, places);
    }
  };

  // 핀을 누르면 카드를 띄우고, 핀이 카드에 가려질 때만 지도를 옮긴다
  const handlePinSelect = (place: PlaceSummary) => {
    setSelected(place);
    if (map) panIntoView(map, place.lat, place.lng);
  };

  usePlacePins(map, places, handlePinSelect);
  const showTempPin = useSearchPin(map, handlePinSelect);

  // 임시 핀이 필요한 선택(지도에서 누른 장소·근처 목록) → 임시 핀 + 카드
  const pickPlace = (place: PlaceSummary) => {
    setCandidates(null);
    showTempPin(place);
    handlePinSelect(place);
  };

  // 여러 장소 목록 → 카드·임시 핀은 닫고 목록만
  const showCandidates = (list: PlaceSummary[]) => {
    showTempPin(null);
    setSelected(null);
    setCandidates(list);
  };

  const closeAll = () => {
    showTempPin(null);
    setSelected(null);
    setCandidates(null);
  };

  // 지도 위 장소를 누름 → 1곳이면 카드, 여러 곳이면 근처 목록
  useTapToPick(map, places, { onPick: pickPlace, onCandidates: showCandidates, onMiss: closeAll });

  // 엔터 검색: 화면 안 결과를 말풍선으로. 대표적인 곳부터 보이고 확대할수록 더 드러남
  const areaResults = useAreaSearch(map, areaKeyword, places, (keyword) =>
    showToast(`지금 화면에 '${keyword}' 결과가 없어요`),
  );
  useResultPins(map, areaResults, places, handlePinSelect);
  const handleSubmitSearch = (keyword: string) => {
    closeAll();
    setAreaKeyword(keyword);
  };

  // 검색 결과 선택 → 임시 핀 + 확대 이동 + 카드
  const handleSearchSelect = (result: PlaceSummary) => {
    setCandidates(null);
    showTempPin(result);
    setSelected(result);
    if (map) focusOn(map, result.lat, result.lng);
  };

  return (
    <main ref={mainRef} className="relative h-dvh overflow-hidden">
      <KakaoMap initialCenter={places[0]} onReady={handleMapReady} />
      <SearchBar
        map={map}
        registered={places}
        onSelect={handleSearchSelect}
        onSubmitSearch={handleSubmitSearch}
        onClear={() => setAreaKeyword(null)}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-end gap-3">
        <div className="pointer-events-auto mr-4 mb-3 last:mb-6">
          <MyLocationButton map={map} onToast={showToast} />
        </div>
        {selected && (
          <div className="pointer-events-auto w-full">
            {/* 리뷰 DB 연결 전이라 stats는 아직 없음. key: 다른 장소를 고르면 접힌 상태로 새로 시작 */}
            <PlaceSheet key={selected.id} place={selected} stats={null} maxHeight={mainHeight} onToast={showToast} />
          </div>
        )}
        {candidates && (
          <div className="pointer-events-auto w-full">
            <NearbyList places={candidates} onSelect={pickPlace} onClose={() => setCandidates(null)} />
          </div>
        )}
      </div>

      {toast && <Toast message={toast} />}
    </main>
  );
}
