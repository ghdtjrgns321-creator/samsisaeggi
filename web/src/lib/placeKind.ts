// 지도 핀 종류 아이콘: 밥·술·커피·빵·고기·회. Kakao 분류 경로("음식점 > 한식 > 육류,고기 > 삼겹살")의 단계 이름으로 고른다.
// 경로 저장 전 등록 장소는 경로가 비어 있어 마지막 단계(category)로 대신 판별한다.
import type { PlaceBase } from "@/types/place";

/** 위에서부터 먼저 맞는 규칙이 이긴다. 경로 단계 중 하나가 목록의 이름과 같으면 맞음 */
const KIND_RULES: { emoji: string; steps: string[] }[] = [
  { emoji: "🍺", steps: ["술집"] },
  { emoji: "🥖", steps: ["제과,베이커리", "도넛", "디저트카페"] },
  { emoji: "🍗", steps: ["육류,고기", "곱창,막창", "치킨"] },
  { emoji: "🐟", steps: ["해물,생선", "회", "초밥,롤"] },
];

export function placeKindEmoji(place: PlaceBase): string {
  const steps = (place.categoryPath || place.category).split(" > ");
  const rule = KIND_RULES.find((r) => r.steps.some((s) => steps.includes(s)));
  if (rule) return rule.emoji;
  return place.groupCode === "CE7" ? "☕" : "🍚";
}
