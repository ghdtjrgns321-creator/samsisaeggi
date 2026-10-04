"use client";

// 버튼 4개: 전화 · 길찾기 · 찜(하트 + 찜 수) · 공유. 찜은 음식점·카페만 (DB 등록 장소 조건)
import { useState, type ReactNode } from "react";
import { isReviewable } from "@/lib/kakao/categories";
import { sharePlace } from "@/lib/share";
import DirectionsSheet from "./DirectionsSheet";
import { usePlaceSheet } from "./PlaceSheetContext";
import { useFavorite } from "./useFavorite";

const buttonClass =
  "flex flex-1 flex-col items-center gap-1 rounded-xl border border-line py-2.5 text-xs font-medium aria-disabled:opacity-40";

function Icon({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export default function PlaceActions() {
  const { place, registered, onToast, onChanged } = usePlaceSheet();
  const canFavorite = isReviewable(place);
  const { favorite, count, toggle } = useFavorite(place, registered?.favoriteCount ?? 0, onChanged, onToast);
  const [directionsOpen, setDirectionsOpen] = useState(false);

  const handleShare = async () => {
    const result = await sharePlace(place);
    if (result === "copied") onToast("링크를 복사했어요");
  };

  return (
    <div className="flex gap-2">
      <a
        href={place.phone ? `tel:${place.phone}` : undefined}
        aria-disabled={!place.phone}
        className={buttonClass}
      >
        <Icon>
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
        </Icon>
        전화
      </a>
      <button type="button" onClick={() => setDirectionsOpen(true)} className={buttonClass}>
        <Icon>
          <path d="M3 11l18-8-8 18-2-8-8-2Z" />
        </Icon>
        길찾기
      </button>
      <button
        type="button"
        onClick={canFavorite ? toggle : undefined}
        aria-disabled={!canFavorite}
        aria-label={favorite ? "찜 해제" : "찜하기"}
        className={`${buttonClass} ${favorite ? "border-primary text-primary" : ""}`}
      >
        <Icon active={favorite}>
          <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
        </Icon>
        {canFavorite ? count : "찜"}
      </button>
      <button type="button" onClick={handleShare} className={buttonClass}>
        <Icon>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
        </Icon>
        공유
      </button>
      {directionsOpen && (
        <DirectionsSheet place={place} onClose={() => setDirectionsOpen(false)} onToast={onToast} />
      )}
    </div>
  );
}
