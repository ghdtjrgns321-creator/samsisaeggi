"use client";

// 방문 인원(− n명 +) + 총 가격 입력. 둘 다 적으면 1인 가격(총 가격 ÷ 인원)을 미리 보여줌
const MAX_PEOPLE = 100; // DB 제약
const MAX_PRICE = 10_000_000; // DB 제약

type Props = {
  people: number | null; // null = 안 적음
  totalPrice: number | null;
  onPeople: (v: number | null) => void;
  onTotalPrice: (v: number | null) => void;
};

const stepClass = "h-9 w-9 rounded-full border border-line text-lg leading-none disabled:opacity-30";

export default function PeoplePrice({ people, totalPrice, onPeople, onTotalPrice }: Props) {
  const handlePrice = (text: string) => {
    const digits = text.replace(/\D/g, "");
    onTotalPrice(digits ? Math.min(MAX_PRICE, Number(digits)) : null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm">방문 인원</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="인원 줄이기"
            disabled={people === null}
            onClick={() => onPeople(people === 1 ? null : (people ?? 1) - 1)}
            className={stepClass}
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-bold">{people ? `${people}명` : "-"}</span>
          <button
            type="button"
            aria-label="인원 늘리기"
            disabled={people === MAX_PEOPLE}
            onClick={() => onPeople((people ?? 0) + 1)}
            className={stepClass}
          >
            +
          </button>
        </div>
      </div>

      <label className="flex items-center justify-between gap-3">
        <span className="shrink-0 text-sm">총 가격</span>
        <span className="flex items-center gap-1">
          <input
            inputMode="numeric"
            placeholder="0"
            value={totalPrice === null ? "" : totalPrice.toLocaleString()}
            onChange={(e) => handlePrice(e.target.value)}
            className="w-32 rounded-lg border border-line px-3 py-2 text-right text-sm"
          />
          <span className="text-sm">원</span>
        </span>
      </label>
      {people && totalPrice ? (
        <p className="text-right text-xs text-gray">
          1인 <b className="text-primary">{(Math.round(totalPrice / people / 100) * 100).toLocaleString()}원</b>
        </p>
      ) : null}
    </div>
  );
}
