// 좌표 → 그 자리 건물 (Kakao 주소 변환). 건물 이름이 없는 곳(도로·공터)은 null.
import type { PlaceBase } from "@/types/place";

type RawAddress = {
  road_address: { address_name: string; building_name: string } | null;
  address: { address_name: string } | null;
};

export function findBuildingAt(lat: number, lng: number): Promise<PlaceBase | null> {
  const { maps } = window.kakao;
  const geocoder = new maps.services.Geocoder();

  return new Promise((resolve) => {
    geocoder.coord2Address(lng, lat, (data: RawAddress[], status: string) => {
      const road = status === maps.services.Status.OK ? data[0]?.road_address : null;
      if (!road?.building_name) {
        resolve(null);
        return;
      }
      resolve({
        id: `building:${road.address_name}`, // Kakao 장소 id가 없어 주소로 대신
        name: road.building_name,
        category: "건물",
        groupCode: "",
        address: road.address_name,
        phone: "",
        lat,
        lng,
      });
    });
  });
}
