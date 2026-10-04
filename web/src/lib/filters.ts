// 검색창 아래 필터 드롭다운 줄. 묶음마다 하나만 켤 수 있고, 묶음끼리는 함께 켜면 모두 만족하는 곳만 남는다.
//  - 장소 종류(음식점·카페): Kakao 분류 코드로 거름 → 화면 안 장소를 말풍선으로 띄움
//  - 시간대·용도·가격: 동료 리뷰에 적힌 값으로 거름 → 리뷰 있는 등록 장소만 해당
import type { Place, PlaceBase } from "@/types/place";

export type FilterOption = { value: string; label: string; emoji: string };

export const FILTER_GROUPS = [
  {
    key: "kind",
    label: "종류",
    emoji: "🍽️",
    options: [
      { value: "FD6", label: "음식점", emoji: "🍽️" },
      { value: "CE7", label: "카페", emoji: "☕" },
    ],
  },
  {
    key: "mealTime",
    label: "시간대",
    emoji: "🕐",
    options: [
      { value: "점심", label: "점심", emoji: "🍚" },
      { value: "저녁", label: "저녁", emoji: "🌙" },
      { value: "회식", label: "회식", emoji: "🍻" },
    ],
  },
  {
    key: "purpose",
    label: "용도",
    emoji: "👥",
    options: [
      { value: "혼밥", label: "혼밥", emoji: "🙋" },
      { value: "동기", label: "동기", emoji: "👥" },
      { value: "팀", label: "팀", emoji: "🧑‍💼" },
      { value: "클라이언트", label: "클라이언트", emoji: "🤝" },
    ],
  },
  {
    key: "price",
    label: "가격",
    emoji: "💸",
    options: [{ value: "10000", label: "1만원 이하", emoji: "💸" }], // value = 1인 가격 상한
  },
] as const satisfies readonly { key: string; label: string; emoji: string; options: readonly FilterOption[] }[];

export type FilterKey = (typeof FILTER_GROUPS)[number]["key"];
export type Filters = Record<FilterKey, string | null>;

export const EMPTY_FILTERS: Filters = { kind: null, mealTime: null, purpose: null, price: null };

export function matchesKind(place: PlaceBase, kind: string | null): boolean {
  return kind === null || place.groupCode === kind;
}

/** 리뷰 값으로 거르는 태그(시간대·용도·가격)가 하나라도 켜졌는지 */
export function hasReviewFilter({ mealTime, purpose, price }: Filters): boolean {
  return Boolean(mealTime || purpose || price);
}

/** 등록 장소가 켜진 태그를 모두 만족하는지 (만족하지 않으면 핀을 숨김) */
export function matchesFilters(place: Place, { kind, mealTime, purpose, price }: Filters): boolean {
  return (
    matchesKind(place, kind) &&
    (mealTime === null || place.mealTimes.includes(mealTime)) &&
    (purpose === null || place.purposes.includes(purpose)) &&
    (price === null || (place.pricePerPerson !== null && place.pricePerPerson <= Number(price)))
  );
}
