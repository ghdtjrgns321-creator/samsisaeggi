// 옆으로 넘기는 리뷰 카드 한 장: 별점 · 날짜 · (예시) · 사진 수 / 한줄평(2줄까지) / 시간대·용도·인원·1인 가격·작업 환경 태그(한 줄)
// 카드 높이를 고정해 넘길 때 줄이 흔들리지 않게 한다. 누르면 이 리뷰만 팝업으로 다 보여준다
import type { Review } from "@/types/review";
import Star, { starFills } from "@/components/review/Star";

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/** 리뷰에 적힌 선택 항목을 태그 글자로 (빈 항목은 생략) */
export function reviewTags(r: Review): string[] {
  const tags: string[] = [];
  if (r.mealTime) tags.push(r.mealTime);
  tags.push(...r.purposes);
  if (r.people) tags.push(`${r.people}명`);
  if (r.people && r.totalPrice) tags.push(`1인 ${(Math.round(r.totalPrice / r.people / 100) * 100).toLocaleString()}원`);
  tags.push(...r.workEnv);
  return tags;
}

/** 별점 · 날짜 · 예시 표시 (카드·팝업·전체 리뷰 창이 같이 쓴다) */
export function ReviewMeta({ review, photoCount }: { review: Review; photoCount?: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span aria-label={`별점 ${review.rating}점`}>
        {starFills(review.rating).map((fill, i) => (
          <Star key={i} fill={fill} />
        ))}
      </span>
      <span className="text-gray">{formatDate(review.createdAt)}</span>
      {review.isSample && <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-gray">예시 데이터</span>}
      {!!photoCount && <span className="ml-auto text-gray">📷 {photoCount}</span>}
    </div>
  );
}

type Props = { review: Review; photoCount: number; onOpen: () => void };

export default function ReviewCard({ review, photoCount, onOpen }: Props) {
  const tags = reviewTags(review);
  return (
    <li className="w-[78%] max-w-80 shrink-0 snap-start">
      <button
        type="button"
        onClick={onOpen}
        className="flex h-32 w-full flex-col rounded-xl border border-line p-3.5 text-left"
      >
        <ReviewMeta review={review} photoCount={photoCount} />
        <p className="mt-1.5 line-clamp-2 text-sm font-medium">“{review.comment}”</p>
        {tags.length > 0 && (
          <div className="mt-auto flex w-full gap-1 overflow-hidden">
            {tags.map((t) => (
              <span key={t} className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-[11px] text-gray">
                {t}
              </span>
            ))}
          </div>
        )}
      </button>
    </li>
  );
}
