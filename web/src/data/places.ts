// 시드 장소 (Kakao 로컬 검색 결과). DB 연결 전 임시 데이터. id = Kakao 장소 id
import type { PlaceBase } from "@/types/place";

export type PlaceKind = "restaurant" | "cafe";

export type Place = PlaceBase & {
  kind: PlaceKind;
  use: string;
  kakaoUrl: string;
  reviewCount: number; // 삼시세끼 리뷰 수 (DB 연결 전까지 0)
  rating: number | null; // 평균 별점 (리뷰 없으면 null)
};

export const PLACES: Place[] = [
  {
    "id": "775002048",
    "name": "당산오돌 송도점",
    "kind": "restaurant",
    "groupCode": "FD6",
    "use": "회식",
    "category": "육류,고기",
    "address": "인천 연수구 센트럴로 160",
    "phone": "032-832-1218",
    "lat": 37.39181623951587,
    "lng": 126.64523848075555,
    "kakaoUrl": "http://place.map.kakao.com/775002048",
    "reviewCount": 0,
    "rating": null
  },
  {
    "id": "939156377",
    "name": "언양닭칼국수 송도점",
    "kind": "restaurant",
    "groupCode": "FD6",
    "use": "점심",
    "category": "칼국수",
    "address": "인천 연수구 해돋이로 160-15",
    "phone": "010-4181-4988",
    "lat": 37.3958393224301,
    "lng": 126.646153470478,
    "kakaoUrl": "http://place.map.kakao.com/939156377",
    "reviewCount": 0,
    "rating": null
  },
  {
    "id": "27418261",
    "name": "진미옥콩나물해장국 송도본점",
    "kind": "restaurant",
    "groupCode": "FD6",
    "use": "혼밥",
    "category": "국밥",
    "address": "인천 연수구 컨벤시아대로130번길 14",
    "phone": "032-833-0444",
    "lat": 37.3929046600718,
    "lng": 126.644935221548,
    "kakaoUrl": "http://place.map.kakao.com/27418261",
    "reviewCount": 0,
    "rating": null
  },
  {
    "id": "604749104",
    "name": "카페꼼마 송도점",
    "kind": "cafe",
    "groupCode": "CE7",
    "use": "작업",
    "category": "카페",
    "address": "인천 연수구 센트럴로 263",
    "phone": "032-719-7222",
    "lat": 37.3979601584889,
    "lng": 126.633965661604,
    "kakaoUrl": "http://place.map.kakao.com/604749104",
    "reviewCount": 0,
    "rating": null
  },
  {
    "id": "26354443",
    "name": "경복궁 송도한옥마을점",
    "kind": "restaurant",
    "groupCode": "FD6",
    "use": "클라이언트",
    "category": "경복궁",
    "address": "인천 연수구 테크노파크로 180",
    "phone": "032-834-2345",
    "lat": 37.39088421513732,
    "lng": 126.63886487344135,
    "kakaoUrl": "http://place.map.kakao.com/26354443",
    "reviewCount": 0,
    "rating": null
  }
];
