"use client";

// 리뷰 사진 고르기 (최대 MAX_PHOTOS장): 고른 사진 미리보기 + ✕로 빼기. 실제 올리기는 등록할 때 한꺼번에
import { useEffect, useMemo } from "react";

export const MAX_PHOTOS = 5;

type Props = { files: File[]; onChange: (files: File[]) => void };

export default function PhotoPicker({ files, onChange }: Props) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const add = (picked: FileList | null) => {
    if (!picked) return;
    onChange([...files, ...Array.from(picked)].slice(0, MAX_PHOTOS));
  };

  return (
    <div className="flex gap-2 overflow-x-auto">
      {files.length < MAX_PHOTOS && (
        <label className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-line text-gray">
          <span className="text-2xl leading-none">+</span>
          <span className="mt-1 text-xs">
            {files.length}/{MAX_PHOTOS}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              add(e.target.files);
              e.target.value = ""; // 같은 사진을 다시 고를 수 있게
            }}
          />
        </label>
      )}
      {previews.map((url, i) => (
        <div key={url} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- 브라우저 안 미리보기 주소 */}
          <img src={url} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            aria-label="사진 빼기"
            onClick={() => onChange(files.filter((_, j) => j !== i))}
            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
