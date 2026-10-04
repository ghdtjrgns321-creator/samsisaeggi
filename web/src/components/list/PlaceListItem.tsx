// 하단 목록의 한 줄: 순위 · 대표 사진 · 이름 · 별점·리뷰 수·분류·도보 시간 · 태그(시간대·용도·작업 환경·1인 가격)
import type { Place } from "@/types/place";
import type { LatLng } from "@/lib/geolocation";
import { distanceMeters, walkMinutes } from "@/lib/geo";
import { photoUrl } from "@/lib/db/photos";
import { byFrequency } from "@/lib/placeStats";

/** 리뷰에서 많이 나온 값으로 만든 태그 */
function listTags(p: Place): string[] {
  const tags = [
    byFrequency(p.mealTimes)[0],
    byFrequency(p.purposes).slice(0, 2).join("·"),
    byFrequency(p.workEnvs)[0],
    p.pricePerPerson ? `1인 ${(Math.round(p.pricePerPerson / 1000) * 1000).toLocaleString()}` : undefined,
  ];
  return tags.filter((t): t is string => Boolean(t));
}

type Props = { place: Place; rank: number; myLocation: LatLng | null; onSelect: (place: Place) => void };

export default function PlaceListItem({ place, rank, myLocation, onSelect }: Props) {
  const walk = myLocation ? `도보 ${walkMinutes(distanceMeters(myLocation, place))}분` : null;
  return (
    <li className="border-b border-line last:border-b-0">
      <button type="button" onClick={() => onSelect(place)} className="flex w-full gap-3 py-3 text-left">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface">
          {place.mainPhotoPath && (
            // eslint-disable-next-line @next/next/no-img-element -- 외부 저장소·자유 이용 사진 URL
            <img src={photoUrl(place.mainPhotoPath)} alt="" loading="lazy" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold">
            <span className="mr-1 text-primary">{rank}</span>
            {place.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-gray">
            <span className="font-bold text-primary">★ {place.rating?.toFixed(1)}</span> 리뷰 {place.reviewCount} · {place.category}
            {walk && ` · ${walk}`}
          </p>
          <div className="mt-1.5 flex gap-1 overflow-hidden">
            {listTags(place).map((t) => (
              <span key={t} className="shrink-0 rounded bg-surface px-1.5 py-0.5 text-[11px] text-gray">
                {t}
              </span>
            ))}
          </div>
        </div>
      </button>
    </li>
  );
}
