// 지도에서 누른 곳에 장소가 여러 개 겹칠 때 띄우는 "이 근처 장소" 목록
import type { PlaceSummary } from "@/types/place";
import SearchResultList from "../search/SearchResultList";

type Props = {
  places: PlaceSummary[];
  onSelect: (place: PlaceSummary) => void;
  onClose: () => void;
};

export default function NearbyList({ places, onSelect, onClose }: Props) {
  return (
    <section className="w-full rounded-t-2xl bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-sm font-bold">이 근처 장소</h2>
        <button type="button" onClick={onClose} aria-label="닫기" className="text-gray">
          ✕
        </button>
      </div>
      <SearchResultList results={places} onSelect={onSelect} />
    </section>
  );
}
