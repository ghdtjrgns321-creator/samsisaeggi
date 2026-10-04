// 지도에서 누른 곳에 장소가 여러 개 겹칠 때 띄우는 목록.
// 모두 같은 주소면 상가 건물 한 점에 몰린 가게들이라 "이 건물 가게 N곳"으로 이유를 드러낸다.
import type { PlaceSummary } from "@/types/place";
import SearchResultList from "../search/SearchResultList";

type Props = {
  places: PlaceSummary[];
  onSelect: (place: PlaceSummary) => void;
  onClose: () => void;
};

export default function NearbyList({ places, onSelect, onClose }: Props) {
  const sameBuilding = places.every((p) => p.address === places[0]?.address);
  return (
    <section className="w-full rounded-t-2xl bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-sm font-bold">
          {sameBuilding ? "이 건물 가게" : "이 근처 장소"} <span className="text-primary">{places.length}곳</span>
        </h2>
        <button type="button" onClick={onClose} aria-label="닫기" className="text-gray">
          ✕
        </button>
      </div>
      <SearchResultList results={places} onSelect={onSelect} />
    </section>
  );
}
