-- 리뷰 별점 0.5점 단위(0.5~5.0) + 한줄평 30자 제한 해제(남용 방지용 500자 상한만).
-- SQL Editor 에서 0004 다음에 실행. place_stats 뷰가 rating 칸을 읽고 있어 뷰를 내렸다가 다시 만든다.

drop view public.place_stats;

alter table public.reviews drop constraint reviews_rating_check;
alter table public.reviews alter column rating type numeric(2, 1);
alter table public.reviews add constraint reviews_rating_check
  check (rating between 0.5 and 5 and rating * 2 = trunc(rating * 2));

alter table public.reviews drop constraint reviews_comment_check;
alter table public.reviews add constraint reviews_comment_check
  check (char_length(comment) between 1 and 500);

create view public.place_stats with (security_invoker = on) as
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
  coalesce(w.work_envs, '{}')                              as work_envs
from public.places p
left join lateral (
  select
    count(*)::int                                   as review_count,
    round(avg(rating)::numeric, 1)::float8          as rating,
    array_agg(meal_time) filter (where meal_time is not null) as meal_times,
    max(people)::int                                as max_people,
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
