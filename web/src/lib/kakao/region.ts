// 좌표 → 동·구 이름 (Kakao 좌표→행정구역 변환). 목록 제목 "송도동 · 점심 7곳"의 지역 이름.
type RawRegion = { region_type: string; region_2depth_name: string; region_3depth_name: string };

/** depth "dong" = 행정동 이름(예: 송도1동, 없으면 구 이름), "gu" = 구 이름(예: 연수구). 실패하면 null */
export function regionNameAt(lat: number, lng: number, depth: "dong" | "gu"): Promise<string | null> {
  const { services } = window.kakao.maps;
  const geocoder = new services.Geocoder();
  return new Promise((resolve) => {
    geocoder.coord2RegionCode(lng, lat, (data: RawRegion[], status: string) => {
      if (status !== services.Status.OK) return resolve(null);
      const region = data.find((r) => r.region_type === "H") ?? data[0]; // H = 행정동
      const dong = depth === "dong" ? region?.region_3depth_name : null;
      resolve(dong || region?.region_2depth_name || null);
    });
  });
}
