// 찜한 식당 한 줄: 사진 · 이름 · 별점·리뷰 수·분류·지역·거리 · "09.28 찜" · ♥(누르면 찜 해제)
import type { Place } from "@/types/place";
import type { LatLng } from "@/lib/geolocation";
import { distanceMeters } from "@/lib/geo";
import { photoUrl } from "@/lib/db/photos";

function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m / 10) * 10}m` : `${(m / 1000).toFixed(1)}km`;
}

function formatMonthDay(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

type Props = {
  place: Place;
  favoritedAt: string;
  myLocation: LatLng | null;
  onSelect: (place: Place) => void;
  onUnfavorite: (place: Place) => void;
};

export default function FavoriteItem({ place, favoritedAt, myLocation, onSelect, onUnfavorite }: Props) {
  const area = place.address.split(" ").slice(0, 2).join(" "); // "인천 연수구"
  const meta = [
    place.rating === null ? "리뷰 없음" : null,
    place.category,
    area,
    myLocation ? formatDistance(distanceMeters(myLocation, place)) : null,
  ].filter(Boolean);

  return (
    <li className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
      <button type="button" onClick={() => onSelect(place)} className="flex min-w-0 flex-1 gap-3 text-left">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface">
          {place.mainPhotoPath && (
            // eslint-disable-next-line @next/next/no-img-element -- 외부 저장소·자유 이용 사진 URL
            <img src={photoUrl(place.mainPhotoPath)} alt="" loading="lazy" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold">{place.name}</p>
          <p className="mt-0.5 truncate text-xs text-gray">
            {place.rating !== null && (
              <>
                <span className="font-bold text-primary">★ {place.rating.toFixed(1)}</span> 리뷰 {place.reviewCount} ·{" "}
              </>
            )}
            {meta.join(" · ")}
          </p>
          <span className="mt-1.5 inline-block rounded bg-surface px-1.5 py-0.5 text-[11px] text-gray">{formatMonthDay(favoritedAt)} 찜</span>
        </div>
      </button>
      <button type="button" onClick={() => onUnfavorite(place)} aria-label={`${place.name} 찜 해제`} className="shrink-0 p-1 text-primary">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
        </svg>
      </button>
    </li>
  );
}
