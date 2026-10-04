// 리뷰 한 건: 별점 · 날짜 · (예시) / 한줄평 / 시간대·용도·인원·1인 가격·작업 환경 태그 / 붙인 사진 (1장 = 가로로 꽉 차게, 여러 장 = 옆으로 넘기기)
import type { Review } from "@/types/review";
import Star, { starFills } from "@/components/review/Star";
import PhotoTile from "./PhotoTile";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/** 리뷰에 적힌 선택 항목을 태그 글자로 (빈 항목은 생략) */
function reviewTags(r: Review): string[] {
  const tags: string[] = [];
  if (r.mealTime) tags.push(r.mealTime);
  tags.push(...r.purposes);
  if (r.people) tags.push(`${r.people}명`);
  if (r.people && r.totalPrice) tags.push(`1인 ${(Math.round(r.totalPrice / r.people / 100) * 100).toLocaleString()}원`);
  tags.push(...r.workEnv);
  return tags;
}

export default function ReviewItem({ review }: { review: Review }) {
  const tags = reviewTags(review);
  return (
    <li className="border-b border-line py-4 last:border-b-0">
      <div className="flex items-center gap-2 text-xs">
        <span aria-label={`별점 ${review.rating}점`}>
          {starFills(review.rating).map((fill, i) => (
            <Star key={i} fill={fill} />
          ))}
        </span>
        <span className="text-gray">{formatDate(review.createdAt)}</span>
        {review.isSample && <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-gray">예시 데이터</span>}
      </div>
      <p className="mt-1.5 text-sm font-medium">“{review.comment}”</p>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-gray">
              {t}
            </span>
          ))}
        </div>
      )}
      {review.photos.length === 1 && <PhotoTile photo={review.photos[0]} className="mt-2.5 aspect-[4/3] w-full rounded-xl" />}
      {review.photos.length > 1 && (
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto">
          {review.photos.map((p) => (
            <PhotoTile key={p.id} photo={p} className="size-30 shrink-0 rounded-lg" />
          ))}
        </div>
      )}
    </li>
  );
}
