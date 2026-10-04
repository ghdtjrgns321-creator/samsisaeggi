// 카카오맵 장소 페이지로 가는 한 줄 링크 (메뉴·사진은 카카오맵에서 보도록)
import type { PlaceBase } from "@/types/place";
import { kakaoPlaceUrl } from "@/lib/kakao/placeLink";

export default function KakaoPlaceLink({ place }: { place: PlaceBase }) {
  const url = kakaoPlaceUrl(place);
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between border-t-8 border-surface px-5 py-4 text-sm font-medium"
    >
      카카오맵에서 메뉴·사진 보기
      <span className="text-gray">›</span>
    </a>
  );
}
