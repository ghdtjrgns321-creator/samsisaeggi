"use client";

// 하단 장소 시트. 접힌 상태 = 기본 정보 + 사진 칸 윗부분 살짝(끌어올릴 수 있다는 표시).
// 시트 어디든 위로 끌거나 손잡이·살짝 보이는 사진 칸을 누르면 펼쳐져 사진 → 카카오맵 링크 → 리뷰를 스크롤로 본다.
// 펼친 상태에선 맨 위에서 아래로 끌면 접히고, 접힌 상태에서 아래로 끌면 시트를 닫고 첫 화면(목록)으로 돌아간다.
// 음식점·카페가 아닌 장소는 기본 정보만 (펼치기 없음).
import { useRef, useState } from "react";
import type { Place, PlaceStats, PlaceSummary } from "@/types/place";
import { isReviewable } from "@/lib/kakao/categories";
import { useElementHeight } from "@/hooks/useElementHeight";
import { useVerticalDrag } from "@/hooks/useVerticalDrag";
import KakaoPlaceLink from "./KakaoPlaceLink";
import PlaceInfo from "./PlaceInfo";
import PlacePhotos from "./PlacePhotos";
import PlaceReviews from "./PlaceReviews";
import ReviewForm from "@/components/review/ReviewForm";
import { PlaceSheetProvider } from "./PlaceSheetContext";

const HANDLE_HEIGHT = 20; // 손잡이 영역 (pt-2 + 막대 + 여백)
const PEEK_HEIGHT = 96; // 접힌 상태에서 보이는 사진 칸: 구분선 + "사진" 제목(60px) + 빈 사진 상자(72px)의 위쪽 절반 → 잘려 보여 끌어올리고 싶게

type Props = {
  place: PlaceSummary;
  registered: Place | undefined; // 등록 장소면 DB 집계값
  stats: PlaceStats | null;
  maxHeight: number; // 펼쳤을 때 높이 (지도 화면 전체)
  onToast: (msg: string) => void;
  onChanged: () => void; // 찜·리뷰·사진을 바꾼 뒤 등록 장소 다시 불러오기
  onClose: () => void; // 접힌 상태에서 아래로 끌면 시트를 닫고 첫 화면으로
};

export default function PlaceSheet({ place, registered, stats, maxHeight, onToast, onChanged, onClose }: Props) {
  const expandable = isReviewable(place);
  const [expanded, setExpanded] = useState(false);
  const [writing, setWriting] = useState(false); // 리뷰 작성 화면 (리뷰 쓰기·사진 올리기 둘 다 여기로)
  const [version, setVersion] = useState(0); // 리뷰 저장할 때마다 +1 → 사진·리뷰 다시 불러오기
  const infoRef = useRef<HTMLDivElement>(null);
  const infoHeight = useElementHeight(infoRef);

  const { dy, dragging, bind, bindScroll } = useVerticalDrag({
    onUp: () => expandable && setExpanded(true),
    onDown: () => (expanded ? setExpanded(false) : onClose()),
    onTap: () => setExpanded((v) => !v),
    expanded,
  });

  const collapsedHeight = HANDLE_HEIGHT + infoHeight + PEEK_HEIGHT;
  const baseHeight = expanded ? maxHeight : collapsedHeight;
  const height = Math.min(maxHeight, Math.max(collapsedHeight, baseHeight - dy));
  const pullDown = expanded ? 0 : Math.max(0, dy); // 접힌 상태에서 아래로 끌면 손가락 따라 내려감
  const dragStyle = { transform: pullDown ? `translateY(${pullDown}px)` : undefined };

  const sheetValue = { place, registered, onToast, onChanged };

  const openWrite = () => setWriting(true);
  const handleSaved = (message: string) => {
    setWriting(false);
    onToast(message);
    setVersion((v) => v + 1);
    onChanged();
  };

  if (!expandable) {
    return (
      <PlaceSheetProvider value={sheetValue}>
      <section
        {...bindScroll}
        style={dragStyle}
        className="w-full rounded-t-2xl bg-white pt-5 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.12)]">
        <PlaceInfo stats={stats} />
      </section>
      </PlaceSheetProvider>
    );
  }

  return (
    <PlaceSheetProvider value={sheetValue}>
    <section
      style={{ height: infoHeight ? height : undefined, ...dragStyle }}
      className={`flex w-full flex-col overflow-hidden bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] ${
        expanded ? "" : "rounded-t-2xl"
      } ${dragging ? "" : "transition-[height,transform] duration-200 ease-out"}`}
    >
      <div {...bind} className="shrink-0 touch-none pt-2 pb-3" style={{ height: HANDLE_HEIGHT }} aria-label="끌어서 펼치기">
        <div className="mx-auto h-1 w-10 rounded-full bg-line" />
      </div>

      <div
        {...bindScroll}
        className={`relative min-h-0 flex-1 overscroll-none ${expanded && !dragging ? "overflow-y-auto" : "overflow-hidden"}`}
      >
        <div ref={infoRef}>
          <PlaceInfo stats={stats} />
        </div>
        <PlacePhotos version={version} onUpload={openWrite} />
        <KakaoPlaceLink place={place} />
        <PlaceReviews version={version} onWrite={openWrite} />
        {writing && <ReviewForm place={place} onClose={() => setWriting(false)} onSaved={handleSaved} />}

        {/* 접힌 상태: 살짝 보이는 사진 칸을 누르면 펼침 (끌기는 본문 전체가 받음) */}
        {!expanded && (
          <div onClick={() => setExpanded(true)} className="absolute inset-x-0" style={{ top: infoHeight, height: PEEK_HEIGHT }} />
        )}
      </div>
    </section>
    </PlaceSheetProvider>
  );
}
