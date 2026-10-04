// 찜 (DB favorites). 로그인 계정 기준이라 기기를 바꿔도 익명 계정이 같으면 유지된다.
import type { PlaceBase } from "@/types/place";
import { supabase } from "@/lib/supabase/client";
import { currentUserId, ensureUserId } from "@/lib/supabase/auth";
import { ensurePlaceRegistered } from "./places";

/** 내가 찜했는지 (로그인 전이면 false, 계정을 새로 만들지 않음) */
export async function isFavorited(placeId: string): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  const { count, error } = await supabase
    .from("favorites")
    .select("place_id", { count: "exact", head: true })
    .eq("place_id", placeId)
    .eq("user_id", userId);
  if (error) throw new Error(`찜 상태를 불러오지 못했어요: ${error.message}`);
  return (count ?? 0) > 0;
}

/** 찜 켜기/끄기. 처음 찜하는 장소는 등록 장소로 함께 저장한다 */
export async function setFavorite(place: PlaceBase, on: boolean): Promise<void> {
  const userId = await ensureUserId();
  if (on) {
    await ensurePlaceRegistered(place);
    const { error } = await supabase.from("favorites").insert({ place_id: place.id });
    if (error && error.code !== "23505") throw new Error(`찜하지 못했어요: ${error.message}`); // 23505 = 이미 찜함
  } else {
    const { error } = await supabase.from("favorites").delete().eq("place_id", place.id).eq("user_id", userId);
    if (error) throw new Error(`찜을 풀지 못했어요: ${error.message}`);
  }
}

export type MyFavorite = { placeId: string; favoritedAt: string }; // favoritedAt: ISO

/** 내가 찜한 장소 (최근 찜한 순). 로그인 전이면 빈 목록 */
export async function fetchMyFavorites(): Promise<MyFavorite[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from("favorites")
    .select("place_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`찜 목록을 불러오지 못했어요: ${error.message}`);
  return (data as { place_id: string; created_at: string }[]).map((r) => ({ placeId: r.place_id, favoritedAt: r.created_at }));
}
