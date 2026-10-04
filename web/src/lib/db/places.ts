// 등록 장소 + 리뷰 집계 읽기 (DB place_stats 뷰)
import type { Place, PlaceBase } from "@/types/place";
import { supabase } from "@/lib/supabase/client";

type PlaceStatsRow = {
  id: string;
  name: string;
  category: string;
  category_path: string;
  group_code: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  review_count: number;
  rating: number | null;
  meal_times: string[];
  purposes: string[];
  work_envs: string[];
  max_people: number | null;
  price_per_person: number | null;
  favorite_count: number;
  main_photo_path: string | null;
};

function toPlace(row: PlaceStatsRow): Place {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categoryPath: row.category_path,
    groupCode: row.group_code,
    address: row.address,
    phone: row.phone,
    lat: row.lat,
    lng: row.lng,
    reviewCount: row.review_count,
    rating: row.rating,
    mealTimes: row.meal_times,
    purposes: row.purposes,
    workEnvs: row.work_envs,
    maxPeople: row.max_people,
    pricePerPerson: row.price_per_person,
    favoriteCount: row.favorite_count,
    mainPhotoPath: row.main_photo_path,
  };
}

export async function fetchRegisteredPlaces(): Promise<Place[]> {
  const { data, error } = await supabase.from("place_stats").select("*");
  if (error) throw new Error(`장소를 불러오지 못했어요: ${error.message}`);
  return (data as PlaceStatsRow[]).map(toPlace);
}

/** 처음 찜·리뷰하는 장소를 등록 장소로 저장 (이미 있으면 그대로) */
export async function ensurePlaceRegistered(place: PlaceBase): Promise<void> {
  const { error } = await supabase.from("places").upsert(
    {
      id: place.id,
      name: place.name,
      category: place.category,
      category_path: place.categoryPath,
      group_code: place.groupCode,
      address: place.address,
      phone: place.phone,
      lat: place.lat,
      lng: place.lng,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (error) throw new Error(`장소를 등록하지 못했어요: ${error.message}`);
}
