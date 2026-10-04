// 사진 한 장. 예시 사진은 "예시 사진" 표시 + 출처(작성자·라이선스)를 사진 위에 작게 붙인다 (CC BY 계열은 출처 필수)
import type { Photo } from "@/lib/db/photos";

export default function PhotoTile({ photo, className }: { photo: Photo; className: string }) {
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
