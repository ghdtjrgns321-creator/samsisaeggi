// 브라우저 위치 API를 Promise로 감싸고, 실패 사유를 사용자에게 보여줄 문장으로 바꾼다.

export type LatLng = { lat: number; lng: number };

const ERROR_MESSAGES: Record<number, string> = {
  1: "위치 권한을 허용해 주세요",
  2: "현재 위치를 확인할 수 없어요",
  3: "위치 확인이 늦어요. 다시 시도해 주세요",
};

export function getCurrentPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("위치 기능을 지원하지 않는 브라우저예요"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(ERROR_MESSAGES[err.code] ?? "위치를 가져오지 못했어요")),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}
