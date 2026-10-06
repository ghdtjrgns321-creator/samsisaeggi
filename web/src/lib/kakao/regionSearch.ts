// 지역 이름 검색 (Kakao 주소 검색). 장소 검색은 "송도"를 이름에 송도가 든 장소로만 찾으므로 동·구는 따로 찾는다.

/** 검색창에 띄울 지역 한 건 */
export type RegionResult = {
  id: string; // 주소 전체 이름 (지역마다 하나)
  name: string; // 가장 작은 단위 이름 (예: 송도동)
  address: string; // 전체 주소 (예: 인천 연수구 송도동)
  lat: number;
  lng: number;
};

const MAX_REGIONS = 3;

type RawAddress = { address_name: string; address_type: string; x: string; y: string };

/** 결과 없음은 빈 배열, 통신 오류는 throw. 번지·도로명이 아닌 행정구역(REGION)만 남긴다 */
export function searchRegions(keyword: string): Promise<RegionResult[]> {
  const { services } = window.kakao.maps;
  const geocoder = new services.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.addressSearch(keyword, (data: RawAddress[], status: string) => {
      if (status === services.Status.ZERO_RESULT) return resolve([]);
      if (status !== services.Status.OK) return reject(new Error(`Kakao 지역 검색 실패: ${status}`));
      const regions = data
        .filter((a) => a.address_type === "REGION")
        .slice(0, MAX_REGIONS)
        .map((a) => ({
          id: a.address_name,
          name: a.address_name.split(" ").pop() ?? a.address_name,
          address: a.address_name,
          lat: Number(a.y),
          lng: Number(a.x),
        }));
      resolve(regions);
    });
  });
}
