// 동료 리뷰 목록. (리뷰 DB 연결 전이라 지금은 비어 있는 안내만)

export default function PlaceReviews({ onWrite }: { onWrite: () => void }) {
  return (
    <section className="border-t-8 border-surface px-5 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <h3 className="mb-3 text-base font-bold">리뷰</h3>
      <div className="flex flex-col items-center gap-3 rounded-xl bg-surface py-8">
        <p className="text-sm text-gray">아직 리뷰가 없어요</p>
        <button type="button" onClick={onWrite} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white">
          첫 리뷰를 남겨주세요
        </button>
      </div>
    </section>
  );
}
