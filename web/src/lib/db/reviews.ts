// 리뷰 읽기 (DB reviews)
import type { Review } from "@/types/review";
import { supabase } from "@/lib/supabase/client";

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
  };
}

/** 장소의 리뷰 (최신순) */
export async function fetchReviews(placeId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, purposes, meal_time, work_env, people, total_price, is_sample, created_at")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`리뷰를 불러오지 못했어요: ${error.message}`);
  return (data as ReviewRow[]).map(toReview);
}
