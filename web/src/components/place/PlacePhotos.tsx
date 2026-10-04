"use client";

// 동료가 올린 사진. 첫 장이 대표 사진(크게), 나머지는 3칸 격자. 없으면 첫 사진 남기기 안내.
// 예시 사진은 "예시 사진" 표시 + 출처(작성자·라이선스)를 사진 위에 작게 붙인다.
import { useEffect, useState } from "react";
import { fetchPhotos, type Photo } from "@/lib/db/photos";
import { usePlaceSheet } from "./PlaceSheetContext";

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function PhotoTile({ photo, className }: { photo: Photo; className: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 외부 저장소·자유 이용 사진 URL */}
      <img src={photo.url} alt="" loading="lazy" className="h-full w-full object-cover" />
      {photo.isSample && (
        <span className="absolute top-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white">예시 사진</span>
      )}
      {photo.credit && (
        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-1.5 pt-3 pb-1 text-[9px] text-white/90">
          {photo.credit}
        </span>
      )}
    </div>
  );
}

// version이 바뀌면(리뷰와 함께 사진 저장 뒤) 다시 불러옴. 올리기 = 리뷰 작성 화면 열기
export default function PlacePhotos({ version, onUpload }: { version: number; onUpload: () => void }) {
  const { place, onToast } = usePlaceSheet();
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    fetchPhotos(place.id)
      .then(setPhotos)
      .catch((e: Error) => onToast(e.message));
  }, [place.id, onToast, version]);

  const [main, ...rest] = photos;

  return (
    <section className="border-t-8 border-surface px-5 pt-4 pb-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold">
          사진 {photos.length > 0 && <span className="text-primary">{photos.length}</span>}
        </h3>
        {main && (
          <button type="button" onClick={onUpload} className="text-sm font-bold text-primary">
            + 올리기
          </button>
        )}
      </div>
      {main ? (
        <div className="space-y-1">
          <PhotoTile photo={main} className="aspect-[4/3] w-full rounded-xl" />
          {rest.length > 0 && (
            <div className="grid grid-cols-3 gap-1">
              {rest.map((p) => (
                <PhotoTile key={p.id} photo={p} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          )}
        </div>
      ) : (
        // 접힌 시트에서 위쪽 절반만 보이도록 낮은 가로형 + 주황 톤으로 눈에 띄게
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
