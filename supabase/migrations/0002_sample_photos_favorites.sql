-- 예시 사진·예시 찜 수를 넣을 수 있게 구조 보강. SQL Editor 에서 0001 다음에 실행.
--  - photos: 예시 사진은 올린 계정이 없고(user_id null), 외부 자유 이용 사진 URL을 path에 그대로 저장, 출처 표기(credit)
--  - places: 예시 찜 수(sample_favorite_count) → 실제 찜(favorites) 개수와 합쳐 보여줌
--    (찜은 실제 로그인 계정에만 묶이므로 예시 계정을 만들지 않고 숫자만 더한다)

alter table public.photos alter column user_id drop not null;
alter table public.photos add column is_sample boolean not null default false;
alter table public.photos add column credit text;  -- 예: "hellochris · CC BY 2.0" (CC BY 계열 사진은 출처 표기 필수)

drop policy "photos 올리기" on public.photos;
create policy "photos 올리기" on public.photos for insert to authenticated
  with check (user_id = auth.uid() and not is_sample);

alter table public.places add column sample_favorite_count integer not null default 0;

-- place_stats 다시 만들기 (places 칸이 늘어 p.* 를 새로 펼쳐야 함)
drop view public.place_stats;
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
  ph.main_photo_path
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
) ph on true;
