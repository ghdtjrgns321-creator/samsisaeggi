// 리뷰 읽기·쓰기 (DB reviews). 리뷰에 붙인 사진(photos.review_id)도 함께 읽는다
import type { PlaceBase } from "@/types/place";
import type { Review } from "@/types/review";
import { supabase } from "@/lib/supabase/client";
import { ensureUserId } from "@/lib/supabase/auth";
import { photoUrl } from "./photos";
import { ensurePlaceRegistered } from "./places";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string;
  purposes: string[];
  meal_time: string | null;
  work_env: string[];
  people: number | null;
  total_price: number | null;
  is_sample: boolean;
  created_at: string;
  photos: { id: string; path: string; created_at: string }[];
};

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    purposes: row.purposes,
    mealTime: row.meal_time,
    workEnv: row.work_env,
    people: row.people,
    totalPrice: row.total_price,
    isSample: row.is_sample,
    createdAt: row.created_at,
    photos: [...row.photos]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((p) => ({ id: p.id, url: photoUrl(p.path) })),
  };
}

/** 장소의 리뷰 (최신순) */
export async function fetchReviews(placeId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, purposes, meal_time, work_env, people, total_price, is_sample, created_at, photos(id, path, created_at)",
    )
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`리뷰를 불러오지 못했어요: ${error.message}`);
  return (data as ReviewRow[]).map(toReview);
}

/** 리뷰 작성 입력값. 선택 항목은 비우면 null·빈 목록 */
export type ReviewInput = {
  rating: number;
  comment: string;
  purposes: string[];
  mealTime: string | null;
  workEnv: string[];
  people: number | null;
  totalPrice: number | null;
};

/** 리뷰 저장 → 새 리뷰 id. 처음 리뷰가 달리는 장소는 등록 장소로 함께 저장한다 */
export async function createReview(place: PlaceBase, input: ReviewInput): Promise<string> {
  await ensureUserId();
  await ensurePlaceRegistered(place);
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      place_id: place.id,
      rating: input.rating,
      comment: input.comment,
      purposes: input.purposes,
      meal_time: input.mealTime,
      work_env: input.workEnv,
      people: input.people,
      total_price: input.totalPrice,
    })
    .select("id")
    .single();
  if (error) throw new Error(`리뷰를 저장하지 못했어요: ${error.message}`);
  return data.id;
}
