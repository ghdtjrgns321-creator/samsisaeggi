"use client";

// 길찾기 앱 선택 시트 (디자인 보드 02-3): 네이버 지도 · 카카오맵 · 티맵
import type { PlaceBase } from "@/types/place";
import { isMobileDevice, kakaoDirectionsUrl, naverAppDirectionsUrl, naverDirectionsUrl, tmapDirectionsUrl } from "@/lib/directions";

const APP_CHECK_MS = 1500;

// 앱이 열리면 페이지가 숨겨진다. 그대로 보이면 미설치로 판단
function openApp(url: string, onMissing: () => void) {
  window.location.href = url;
  setTimeout(() => {
    if (document.visibilityState === "visible") onMissing();
  }, APP_CHECK_MS);
}

type Props = {
  place: PlaceBase;
  onClose: () => void;
  onToast: (msg: string) => void;
};

type AppRowProps = { badge: string; color: string; textColor?: string; name: string; href?: string; onClick?: () => void };

function AppRow({ badge, color, textColor = "#fff", name, href, onClick }: AppRowProps) {
  const inner = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold" style={{ background: color, color: textColor }}>
        {badge}
      </span>
      <span className="flex-1 text-left text-sm font-medium">{name}</span>
      <span className="text-gray">›</span>
    </>
  );
  const className = "flex w-full items-center gap-3 px-5 py-3 hover:bg-surface";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

export default function DirectionsSheet({ place, onClose, onToast }: Props) {
  const openTmap = () => {
    if (!isMobileDevice()) {
      onToast("티맵은 휴대폰에서만 열 수 있어요");
      return;
    }
    openApp(tmapDirectionsUrl(place), () => onToast("티맵 앱이 설치되어 있지 않아요"));
  };

  // 휴대폰은 네이버 지도 앱으로, 앱이 없거나 PC면 웹으로
  const openNaver = () => {
    const web = naverDirectionsUrl(place);
    if (!isMobileDevice()) {
      window.open(web, "_blank", "noopener,noreferrer");
      return;
    }
    openApp(naverAppDirectionsUrl(place), () => {
      window.location.href = web;
    });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-label="길찾기 앱 선택"
        className="w-full rounded-t-2xl bg-white pt-5 pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pb-3">
          <h3 className="text-base font-bold">어떤 앱으로 길을 찾을까요?</h3>
          <p className="mt-0.5 truncate text-xs text-gray">
            {place.name} · {place.address}
          </p>
        </div>
        <AppRow badge="N" color="#03c75a" name="네이버 지도" onClick={openNaver} />
        <AppRow badge="K" color="#fee500" textColor="#191919" name="카카오맵" href={kakaoDirectionsUrl(place)} />
        <AppRow badge="T" color="#ef2d56" name="티맵" onClick={openTmap} />
        <div className="px-5 pt-2">
          <button type="button" onClick={onClose} className="w-full rounded-xl bg-surface py-3 text-sm font-medium">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
