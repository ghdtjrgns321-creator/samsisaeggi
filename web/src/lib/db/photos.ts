// 장소 사진 (DB photos). 읽기는 리뷰와 함께(lib/db/reviews.ts). path는 저장소(photos 버킷) 경로이거나, 예시 사진이면 외부 자유 이용 사진 URL.
import { supabase } from "@/lib/supabase/client";
import { ensureUserId } from "@/lib/supabase/auth";
import { shrinkImage } from "@/lib/image";

export type Photo = {
  id: string;
  url: string;
  credit: string | null; // 예시 사진 출처 표기 (CC BY 계열은 필수)
  isSample: boolean;
};

export function photoUrl(path: string): string {
  return path.startsWith("http") ? path : supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
}

/** 리뷰에 붙인 사진 올리기: 줄여서 저장소({place_id}/{user_id}/…)에 올리고 photos 행 저장. 실패한 장 수를 돌려준다 */
export async function uploadReviewPhotos(placeId: string, reviewId: string, files: File[]): Promise<number> {
  const userId = await ensureUserId();
  const results = await Promise.allSettled(
    files.map(async (file) => {
      const path = `${placeId}/${userId}/${crypto.randomUUID()}.jpg`;
      const upload = await supabase.storage.from("photos").upload(path, await shrinkImage(file), { contentType: "image/jpeg" });
      if (upload.error) throw upload.error;
      const { error } = await supabase.from("photos").insert({ place_id: placeId, review_id: reviewId, path });
      if (error) throw error;
    }),
  );
  return results.filter((r) => r.status === "rejected").length;
}
