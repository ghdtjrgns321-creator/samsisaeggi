// 장소 공유: 휴대폰은 기본 공유 창, 지원 안 하는 브라우저(PC 등)는 링크 복사.
// 링크(?place=id)로 들어오면 MapHome이 해당 장소 카드를 연다.
import type { PlaceBase } from "@/types/place";

export function placeShareUrl(placeId: string): string {
  return `${window.location.origin}/?place=${encodeURIComponent(placeId)}`;
}

/** "shared" | "copied" 반환. 사용자가 공유 창을 닫으면 "cancelled" */
export async function sharePlace(place: PlaceBase): Promise<"shared" | "copied" | "cancelled"> {
  const url = placeShareUrl(place.id);
  if (navigator.share) {
    try {
      await navigator.share({ title: place.name, text: `${place.name} · ${place.address}`, url });
      return "shared";
    } catch {
      return "cancelled";
    }
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}
