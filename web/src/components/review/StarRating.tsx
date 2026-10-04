"use client";

// 별점 입력 (0.5점 단위): 별의 왼쪽 절반을 누르면 .5, 오른쪽 절반을 누르면 정수 점수. 0 = 아직 안 고름
import Star, { starFills } from "./Star";

export default function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="별점">
      {starFills(value).map((fill, i) => (
        <span key={i} className="relative">
          <Star fill={fill} className="text-4xl" />
          {[i + 0.5, i + 1].map((score, half) => (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={value === score}
              aria-label={`${score}점`}
              onClick={() => onChange(score)}
              className={`absolute inset-y-0 w-1/2 ${half === 0 ? "left-0" : "right-0"}`}
            />
          ))}
        </span>
      ))}
      {value > 0 && <span className="ml-2 text-sm font-bold text-primary">{value.toFixed(1)}</span>}
    </div>
  );
}
