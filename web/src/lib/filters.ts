// 검색창 아래 필터 드롭다운 줄. 묶음마다 하나만 켤 수 있고, 묶음끼리는 함께 켜면 모두 만족하는 곳만 남는다.
//  - 장소 종류(음식점·카페): Kakao 분류 코드로 거름 → 화면 안 장소를 말풍선으로 띄움
//  - 나머지 태그: 동료 리뷰에 적힌 값으로 거름 → 리뷰 있는 등록 장소만 해당.
//    종류에 따라 묶음이 다름 (음식점·전체 = 시간대·용도 / 카페 = 용도·작업 환경)
import type { Place, PlaceBase } from "@/types/place";

export type FilterOption = { value: string; label: string; emoji: string };
export type FilterKey = "kind" | "mealTime" | "purpose" | "workEnv";
export type FilterGroup = { key: FilterKey; label: string; emoji: string; options: readonly FilterOption[] };
export type Filters = Record<FilterKey, string | null>;

const CAFE = "CE7";

export const KIND_GROUP: FilterGroup = {
  key: "kind",
  label: "종류",
  emoji: "🍽️",
  options: [
    { value: "FD6", label: "음식점", emoji: "🍽️" },
    { value: CAFE, label: "카페", emoji: "☕" },
  ],
};

const RESTAURANT_TAGS: readonly FilterGroup[] = [
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
];

const CAFE_TAGS: readonly FilterGroup[] = [
  {
    key: "purpose",
    label: "용도",
    emoji: "💼",
    options: [
      { value: "작업", label: "작업", emoji: "💻" },
      { value: "미팅", label: "미팅", emoji: "🤝" },
      { value: "휴식", label: "휴식", emoji: "🛋️" },
    ],
  },
  {
    key: "workEnv",
    label: "작업 환경",
    emoji: "🔌",
    options: [
      { value: "콘센트", label: "콘센트", emoji: "🔌" },
      { value: "와이파이", label: "와이파이", emoji: "📶" },
      { value: "조용함", label: "조용함", emoji: "🤫" },
      { value: "좌석 넉넉", label: "좌석 넉넉", emoji: "🪑" },
    ],
  },
];

/** 종류 칩 오른쪽에 붙는 리뷰 태그 묶음 */
export function tagGroupsFor(kind: string | null): readonly FilterGroup[] {
  return kind === CAFE ? CAFE_TAGS : RESTAURANT_TAGS;
}

export const EMPTY_FILTERS: Filters = { kind: null, mealTime: null, purpose: null, workEnv: null };

/** 종류를 바꿈. 태그 묶음이 달라지면(음식점↔카페) 켜 둔 리뷰 태그는 끈다 */
export function withKind(filters: Filters, kind: string | null): Filters {
  return tagGroupsFor(kind) === tagGroupsFor(filters.kind) ? { ...filters, kind } : { ...EMPTY_FILTERS, kind };
}

export function matchesKind(place: PlaceBase, kind: string | null): boolean {
  return kind === null || place.groupCode === kind;
}

/** 리뷰 값으로 거르는 태그(시간대·용도·작업 환경)가 하나라도 켜졌는지 */
export function hasReviewFilter({ mealTime, purpose, workEnv }: Filters): boolean {
  return Boolean(mealTime || purpose || workEnv);
}

/** 등록 장소가 켜진 태그를 모두 만족하는지 (만족하지 않으면 핀을 숨김) */
export function matchesFilters(place: Place, { kind, mealTime, purpose, workEnv }: Filters): boolean {
  return (
    matchesKind(place, kind) &&
    (mealTime === null || place.mealTimes.includes(mealTime)) &&
    (purpose === null || place.purposes.includes(purpose)) &&
    (workEnv === null || place.workEnvs.includes(workEnv))
  );
}

