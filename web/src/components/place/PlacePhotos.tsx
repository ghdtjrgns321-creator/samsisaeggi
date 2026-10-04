"use client";

// 동료가 올린 사진. 첫 장이 대표 사진(크게), 나머지는 3칸 격자. 없으면 첫 사진 남기기 안내.
// (사진 올리기·저장은 DB 연결 단계에서)

type Props = {
  photoUrls: string[];
  onUpload: () => void;
};

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

export default function PlacePhotos({ photoUrls, onUpload }: Props) {
  const [main, ...rest] = photoUrls;

  return (
    <section className="border-t-8 border-surface px-5 pt-4 pb-5">
      <h3 className="mb-3 text-base font-bold">사진</h3>
      {main ? (
        <div className="space-y-1">
          {/* eslint-disable-next-line @next/next/no-img-element -- 사용자 업로드 사진(외부 저장소 URL) */}
          <img src={main} alt="대표 사진" className="aspect-[4/3] w-full rounded-xl object-cover" />
          <div className="grid grid-cols-3 gap-1">
            {rest.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="aspect-square w-full rounded-lg object-cover" />
            ))}
          </div>
        </div>
      ) : (
        // 접힌 시트에서 통째로 보이도록 낮은 가로형 + 주황 톤으로 눈에 띄게
        <button
          type="button"
          onClick={onUpload}
          className="flex h-18 w-full items-center gap-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary-soft px-4 text-primary"
        >
          <CameraIcon />
          <span className="flex-1 text-left text-sm font-bold">첫 번째 사진을 남겨주세요!</span>
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">+ 올리기</span>
        </button>
      )}
    </section>
  );
}
