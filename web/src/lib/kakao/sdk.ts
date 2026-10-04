// Kakao Maps SDK 로딩 정보와 전역 타입.
// SDK에 공식 타입이 없어 any로 두고, 쓰는 쪽에서 KakaoMap 별칭으로 의미만 드러낸다.

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KakaoMap = any;

// libraries=services: 장소 검색(Places) 기능 포함
export const KAKAO_SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&libraries=services&autoload=false`;
