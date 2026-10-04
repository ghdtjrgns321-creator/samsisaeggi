"use client";

// 목록 시트의 "내 찜" 탭: "찜한 식당 N" + [최신순][거리순] + 찜한 곳 목록.
// 거리순은 내 위치가 필요해서, 위치를 아직 모르면 누를 때 위치를 먼저 찾는다.
import { useState } from "react";
import type { Place } from "@/types/place";
import { getCurrentPosition, type LatLng } from "@/lib/geolocation";
import { distanceMeters } from "@/lib/geo";
import { setFavorite, type MyFavorite } from "@/lib/db/favorites";
import FavoriteItem from "./FavoriteItem";

type Sort = "recent" | "distance";

type Props = {
  favorites: MyFavorite[]; // 최근 찜한 순
  allPlaces: Place[];
  myLocation: LatLng | null;
  onLocated: (at: LatLng) => void;
  onSelect: (place: Place) => void;
  onChanged: () => void; // 찜 해제 후 목록·찜 수 다시 불러오기
  onError: (msg: string) => void;
};

function SortChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-[7px] text-[13px] font-medium ${active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"}`}
    >
      {children}
    </button>
  );
}

export default function FavoritesTab({ favorites, allPlaces, myLocation, onLocated, onSelect, onChanged, onError }: Props) {
  const [sort, setSort] = useState<Sort>("recent");

  const items = favorites
    .map((f) => ({ ...f, place: allPlaces.find((p) => p.id === f.placeId) }))
    .filter((f): f is MyFavorite & { place: Place } => Boolean(f.place));
  const sorted =
    sort === "distance" && myLocation
      ? [...items].sort((a, b) => distanceMeters(myLocation, a.place) - distanceMeters(myLocation, b.place))
      : items;

  const sortByDistance = async () => {
    if (!myLocation) {
      try {
        onLocated(await getCurrentPosition());
      } catch (e) {
        onError((e as Error).message);
        return;
      }
    }
    setSort("distance");
  };

  const unfavorite = async (place: Place) => {
    try {
      await setFavorite(place, false);
      onChanged();
    } catch (e) {
      onError((e as Error).message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between pt-3 pb-2">
        <h2 className="text-base font-bold">
          찜한 식당 <span className="text-primary">{items.length}</span>
        </h2>
      </div>
      <div className="flex gap-1.5 pb-1">
        <SortChip active={sort === "recent"} onClick={() => setSort("recent")}>
          최신순
        </SortChip>
        <SortChip active={sort === "distance"} onClick={sortByDistance}>
          거리순
        </SortChip>
      </div>
      {sorted.length > 0 ? (
        <ul>
          {sorted.map((f) => (
            <FavoriteItem
              key={f.placeId}
              place={f.place}
              favoritedAt={f.favoritedAt}
              myLocation={myLocation}
              onSelect={onSelect}
              onUnfavorite={unfavorite}
            />
          ))}
        </ul>
      ) : (
        <p className="py-6 text-center text-sm text-gray">아직 찜한 곳이 없어요. 카드의 ♡를 눌러 모아보세요</p>
      )}
    </div>
  );
}
