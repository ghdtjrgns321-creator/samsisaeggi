"use client";

// 지도 홈 화면: 지도 + 상단 검색창 + 하단(내 위치 버튼 · 목록 시트 / 장소 카드 / 근처 목록)을 조립하고, 선택 상태를 관리.
// 등록 장소는 DB에서 불러온다.
import { useCallback, useMemo, useRef, useState } from "react";
import type { Place, PlaceSummary } from "@/types/place";
import type { KakaoMap as KakaoMapInstance } from "@/lib/kakao/sdk";
import { DEFAULT_CENTER, fitToPlaces, focusOn, panIntoView, panTo } from "@/lib/kakao/mapView";
import { getLinkedPlaceId } from "@/lib/deepLink";
import { EMPTY_FILTERS, filtersSummary, hasReviewFilter, matchesFilters, matchesKind, type Filters } from "@/lib/filters";
import type { LatLng } from "@/lib/geolocation";
import KakaoMap from "./map/KakaoMap";
import { useAreaSearch } from "./map/useAreaSearch";
import MyLocationButton from "./map/MyLocationButton";
import { usePlacePins } from "./map/usePlacePins";
import { isInBounds, useMapBounds } from "./map/useMapBounds";
import { useRegionName } from "./map/useRegionName";
import PlaceListSheet from "./list/PlaceListSheet";
import { useResultPins } from "./map/useResultPins";
import { useSearchPin } from "./map/useSearchPin";
import { useTapToPick } from "./map/useTapToPick";
import NearbyList from "./place/NearbyList";
import PlaceSheet from "./place/PlaceSheet";
import FilterChips from "./search/FilterChips";
import SearchBar from "./search/SearchBar";
import Toast from "./Toast";
import { useElementHeight } from "@/hooks/useElementHeight";
import { useRegisteredPlaces } from "@/hooks/useRegisteredPlaces";
import { toPlaceStats } from "@/lib/placeStats";
import { namedPinIds } from "@/lib/pinRanking";

const TOAST_MS = 2000;
const NO_PLACES: Place[] = [];

export default function MapHome() {
  const mainRef = useRef<HTMLElement>(null);
  const mainHeight = useElementHeight(mainRef); // 장소 시트를 펼쳤을 때 높이
  const [map, setMap] = useState<KakaoMapInstance | null>(null);
  const [selected, setSelected] = useState<PlaceSummary | null>(null);
  const [candidates, setCandidates] = useState<PlaceSummary[] | null>(null);
  const [areaKeyword, setAreaKeyword] = useState<string | null>(null); // 엔터 검색어 (null = 검색 안 함)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [myLocation, setMyLocation] = useState<LatLng | null>(null); // 내 위치 버튼으로 찾은 위치 (목록의 도보 시간)
  const [listExpanded, setListExpanded] = useState(false); // 목록 시트를 펼쳤으면 내 위치 버튼을 숨김
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimerRef.current); // 새 알림이 이전 알림 타이머에 일찍 지워지지 않게
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  // 첫 화면 맞추기: 지도와 등록 장소가 둘 다 준비되면 한 번만.
  // 공유 링크로 들어왔으면 그 장소를 바로 열고, 아니면 등록 장소 전체가 보이게
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const loadedRef = useRef<Place[] | null>(null);
  const initializedRef = useRef(false);
  const initView = useCallback(() => {
    const m = mapRef.current;
    const ps = loadedRef.current;
    if (!m || !ps || initializedRef.current) return;
    initializedRef.current = true;
    const linked = ps.find((p) => p.id === getLinkedPlaceId());
    if (linked) {
      setSelected(linked);
      focusOn(m, linked.lat, linked.lng);
    } else {
      fitToPlaces(m, ps);
    }
  }, []);

  const handlePlacesLoaded = useCallback(
    (ps: Place[]) => {
      loadedRef.current = ps;
      initView();
    },
    [initView],
  );
  const { places: loaded, reload: reloadPlaces } = useRegisteredPlaces(showToast, handlePlacesLoaded);
  const places = loaded ?? NO_PLACES;

  const handleMapReady = (m: KakaoMapInstance) => {
    setMap(m);
    mapRef.current = m;
    initView();
  };

  // 핀을 누르면 카드를 띄우고(근처 목록이 떠 있었으면 닫음), 핀이 카드에 가려질 때만 지도를 옮긴다
  const handlePinSelect = (place: PlaceSummary) => {
    setCandidates(null);
    setSelected(place);
    if (map) panIntoView(map, place.lat, place.lng);
  };

  const bounds = useMapBounds(map);
  // 둘러보기: 검색어 없이도 화면 안에 리뷰 있는 곳이 하나도 없으면(처음 보는 동네) 리뷰 없는 음식점·카페를 보여준다
  const browse =
    loaded !== null &&
    bounds !== null &&
    !areaKeyword &&
    !hasReviewFilter(filters) &&
    !places.some((p) => p.reviewCount > 0 && matchesKind(p, filters.kind) && isInBounds(bounds, p.lat, p.lng));

  // 엔터 검색어(또는 둘러보기): 화면 안 결과를 말풍선으로. 대표적인 곳부터 보이고 확대할수록 더 드러남
  const areaResults = useAreaSearch(map, { keyword: areaKeyword, kind: filters.kind, browse }, places, () => {
    if (areaKeyword) showToast(`지금 화면에 '${areaKeyword}' 결과가 없어요`);
  });
  // 검색 중이면 등록 핀도 검색 결과에 나온 곳만 (null = 검색 안 함 → 전부)
  const hitIds = useMemo(() => (areaKeyword ? new Set(areaResults.map((p) => p.id)) : null), [areaKeyword, areaResults]);

  // 지도 핀: 리뷰 있는 등록 장소 중 태그 조건(·검색어)에 맞는 곳. 지금 화면 안에서 리뷰 많은 상위 몇 곳만 이름까지
  const pinnedPlaces = useMemo(
    () => places.filter((p) => p.reviewCount > 0 && matchesFilters(p, filters) && (!hitIds || hitIds.has(p.id))),
    [places, filters, hitIds],
  );
  // 상위 곳이 그대로면 같은 Set을 유지해 핀을 다시 그리지 않는다 (지도를 조금 움직일 때마다 깜빡이지 않게)
  const placesInView = useMemo(
    () => (bounds ? pinnedPlaces.filter((p) => isInBounds(bounds, p.lat, p.lng)) : pinnedPlaces),
    [pinnedPlaces, bounds],
  );
  const regionName = useRegionName(bounds);
  const namedKey = [...namedPinIds(placesInView)]
    .sort()
    .join(",");
  const namedIds = useMemo(() => new Set(namedKey.split(",")), [namedKey]);
  const showTempPin = useSearchPin(map, handlePinSelect);

  // 지도에서 장소를 고름(핀·말풍선·지도 위 장소·근처 목록) → 카드 + 임시 핀을 그 장소로 옮김
  // (리뷰 있는 등록 장소면 임시 핀은 지워진다 — 이미 핀이 있음)
  const pickPlace = (place: PlaceSummary) => {
    showTempPin(place);
    handlePinSelect(place);
  };
  usePlacePins(map, pinnedPlaces, namedIds, pickPlace);

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

  // 흰 말풍선 = 검색 결과 중 리뷰 없는 곳 (리뷰 있는 곳은 위 등록 핀으로 그림)
  // 리뷰 값 태그(시간대·용도·작업 환경)가 켜지면 리뷰 없는 곳은 조건을 알 수 없으므로 숨긴다
  // useMemo: 렌더마다 새 배열이 되면 말풍선을 매번 다시 그리게 되므로 고정
  const visibleResults = useMemo(
    () => (hasReviewFilter(filters) ? [] : areaResults.filter((p) => !p.reviewCount)),
    [filters, areaResults],
  );
  useResultPins(map, visibleResults, pinnedPlaces, namedIds, pickPlace);

  // 태그: 리뷰 값 태그를 새로 켰는데 맞는 등록 장소가 없으면 바로 알려준다
  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    const turnedOnReviewTag = hasReviewFilter(next) && JSON.stringify(next) !== JSON.stringify(filters);
    if (turnedOnReviewTag && !places.some((p) => matchesFilters(p, next))) {
      showToast("아직 조건에 맞는 리뷰가 없어요");
    }
  };

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

  // 목록에서 고름: 내 찜은 화면 밖일 수 있으니 항상 그 장소로 옮기고, 핀이 없는 곳(리뷰 0개)은 임시 핀
  const handleListSelect = (place: Place) => {
    setListExpanded(false); // 카드를 닫고 돌아오면 목록은 접힌 상태로 다시 나타남
    showTempPin(place);
    setSelected(place);
    if (map) panTo(map, place.lat, place.lng);
  };

  // 선택한 장소가 등록 장소면 최신 집계(별점·요약)를 쓴다
  const selectedPlace = selected ? places.find((p) => p.id === selected.id) : undefined;

  return (
    <main ref={mainRef} className="relative h-dvh overflow-hidden">
      <KakaoMap initialCenter={DEFAULT_CENTER} onReady={handleMapReady} />
      <SearchBar
        map={map}
        registered={places}
        onSelect={handleSearchSelect}
        onSubmitSearch={handleSubmitSearch}
        onClear={() => setAreaKeyword(null)}
      />
      <FilterChips filters={filters} onChange={handleFiltersChange} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-end gap-3">
        {!(listExpanded && !selected && !candidates) && (
          <div className="pointer-events-auto mr-4 mb-3 last:mb-6">
            <MyLocationButton map={map} onToast={showToast} onLocated={setMyLocation} />
          </div>
        )}
        {selected && (
          <div className="pointer-events-auto w-full">
            {/* key: 다른 장소를 고르면 접힌 상태로 새로 시작 */}
            <PlaceSheet
              key={selected.id}
              place={selected}
              registered={selectedPlace}
              stats={selectedPlace ? toPlaceStats(selectedPlace) : null}
              maxHeight={mainHeight}
              onToast={showToast}
              onChanged={reloadPlaces}
              onClose={closeAll}
            />
          </div>
        )}
        {candidates && (
          <div className="pointer-events-auto w-full">
            <NearbyList places={candidates} onSelect={pickPlace} onClose={() => setCandidates(null)} />
          </div>
        )}
        {/* 아무것도 고르지 않았을 때: 지금 화면 안 리뷰 있는 장소 목록 */}
        {!selected && !candidates && (
          <div className="pointer-events-auto w-full">
            <PlaceListSheet
              places={placesInView}
              allPlaces={places}
              regionName={regionName}
              filtersLabel={filtersSummary(filters)}
              myLocation={myLocation}
              maxHeight={mainHeight}
              onSelect={handleListSelect}
              onError={showToast}
              onExpandedChange={setListExpanded}
              onLocated={setMyLocation}
              onPlacesChanged={reloadPlaces}
            />
          </div>
        )}
      </div>

      {toast && <Toast message={toast} />}
    </main>
  );
}
