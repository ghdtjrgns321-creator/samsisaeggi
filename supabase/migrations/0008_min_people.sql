-- 카드 요약 "다녀간 인원" 칸을 "최소~최대인"으로 보여주려고 최소 방문 인원을 붙인다 (인원을 적은 리뷰 기준).
-- SQL Editor 에서 0007 다음에 실행. 칸을 맨 끝에 붙이므로 create or replace 로 충분.
create or replace view public.place_stats with (security_invoker = on) as
select
  p.id, p.name, p.category, p.group_code, p.address, p.phone, p.lat, p.lng, p.created_at,
  coalesce(r.review_count, 0)                              as review_count,
  r.rating,
  coalesce(r.meal_times, '{}')                             as meal_times,
  coalesce(u.purposes, '{}')                               as purposes,
  r.max_people,
  r.price_per_person,
  coalesce(f.favorite_count, 0) + p.sample_favorite_count  as favorite_count,
  ph.main_photo_path,
  coalesce(w.work_envs, '{}')                              as work_envs,
  p.category_path,
  r.min_people
from public.places p
left join lateral (
  select
    count(*)::int                                   as review_count,
    round(avg(rating)::numeric, 1)::float8          as rating,
    array_agg(meal_time) filter (where meal_time is not null) as meal_times,
    max(people)::int                                as max_people,
    min(people)::int                                as min_people,
    (percentile_cont(0.5) within group (order by total_price::numeric / people)
       filter (where total_price is not null and people is not null))::int as price_per_person
  from public.reviews
  where place_id = p.id
) r on true
left join lateral (
  select array_agg(x) as purposes
  from public.reviews rv, unnest(rv.purposes) x
  where rv.place_id = p.id
) u on true
left join lateral (
  select count(*)::int as favorite_count from public.favorites where place_id = p.id
) f on true
left join lateral (
  select path as main_photo_path from public.photos where place_id = p.id order by created_at limit 1
) ph on true
left join lateral (
  select array_agg(x) as work_envs
  from public.reviews rv, unnest(rv.work_env) x
  where rv.place_id = p.id
) w on true;
