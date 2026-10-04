// 요약 3칸: 용도 · 인원 · 1인 가격. 리뷰가 없거나 그 값을 적은 리뷰가 없으면 "-".
import type { PlaceStats } from "@/types/place";

/** 천 원 단위 반올림 ("약 9,000원") */
const roundToThousand = (won: number) => Math.round(won / 1000) * 1000;

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-xs text-gray">{label}</p>
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
    </div>
  );
}

export default function PlaceStatsRow({ stats }: { stats: PlaceStats | null }) {
  return (
    <div className="flex divide-x divide-line rounded-xl bg-surface py-3">
      <Cell label="용도" value={stats?.uses.slice(0, 2).join(" · ") || "-"} />
      <Cell label="인원" value={stats?.maxPeople ? `최대 ${stats.maxPeople}인` : "-"} />
      <Cell label="1인 가격" value={stats?.pricePerPerson ? `약 ${roundToThousand(stats.pricePerPerson).toLocaleString()}원` : "-"} />
    </div>
  );
}
