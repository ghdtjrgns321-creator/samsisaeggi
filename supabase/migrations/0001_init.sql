-- 삼시세끼 초기 스키마: 등록 장소 · 리뷰 · 사진 · 찜 + 집계 뷰 + 권한(RLS) + 사진 저장소
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여넣고 Run.

-- ─────────────────────────────────────────────
-- 1. 테이블
-- ─────────────────────────────────────────────

-- 삼시세끼에 등록된 장소 (첫 리뷰 때 등록). id = Kakao 장소 id
create table public.places (
  id          text primary key,
  name        text not null,
  category    text not null,              -- Kakao 분류 마지막 단계 (예: 칼국수)
  group_code  text not null check (group_code in ('FD6', 'CE7')),  -- 음식점 / 카페
  address     text not null,
  phone       text not null default '',
  lat         double precision not null,
  lng         double precision not null,
  created_at  timestamptz not null default now()
);

create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  place_id     text not null references public.places (id) on delete cascade,
  user_id      uuid references auth.users (id) on delete set null default auth.uid(),  -- null = 예시 데이터
  rating       smallint not null check (rating between 1 and 5),
  comment      text not null check (char_length(comment) between 1 and 30),
  purposes     text[] not null default '{}',  -- 음식점: 혼밥·동기·팀·클라이언트 / 카페: 작업·미팅·휴식
  meal_time    text check (meal_time in ('점심', '저녁', '회식')),  -- 음식점만
  work_env     text[] not null default '{}',  -- 카페만: 콘센트·와이파이·조용함·좌석 넉넉
  people       smallint check (people between 1 and 100),
  total_price  integer check (total_price between 0 and 10000000),
  is_sample    boolean not null default false,  -- 시드로 넣은 예시 리뷰
  created_at   timestamptz not null default now()
);
create index reviews_place_id_idx on public.reviews (place_id);

-- 사용자가 올린 사진. path = 저장소(photos 버킷) 안 경로: {place_id}/{user_id}/{파일명}
create table public.photos (
  id          uuid primary key default gen_random_uuid(),
  place_id    text not null references public.places (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  path        text not null unique,
  created_at  timestamptz not null default now()
);
create index photos_place_id_idx on public.photos (place_id, created_at);

-- 찜: 한 계정이 한 장소에 한 번
create table public.favorites (
  place_id    text not null references public.places (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  created_at  timestamptz not null default now(),
  primary key (place_id, user_id)
);

-- ─────────────────────────────────────────────
-- 2. 집계 뷰: 화면은 이 뷰만 읽는다
-- ─────────────────────────────────────────────
create view public.place_stats with (security_invoker = on) as
select
  p.*,
  coalesce(r.review_count, 0)        as review_count,
  r.rating,                                          -- 리뷰 없으면 null
  coalesce(r.meal_times, '{}')       as meal_times,  -- 리뷰에 나온 시간대 (중복 포함)
  coalesce(u.purposes, '{}')         as purposes,    -- 리뷰에 나온 용도 (중복 포함 → 많이 나온 순 계산용)
  r.max_people,
  r.price_per_person,                                -- 1인 가격 중앙값 (총 가격·인원 둘 다 적은 리뷰만)
  coalesce(f.favorite_count, 0)      as favorite_count,
  ph.main_photo_path                                 -- 가장 먼저 올라온 사진
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

-- ─────────────────────────────────────────────
-- 3. 권한(RLS): 읽기는 누구나, 쓰기는 로그인(익명 포함) 계정 본인 것만
-- ─────────────────────────────────────────────
alter table public.places    enable row level security;
alter table public.reviews   enable row level security;
alter table public.photos    enable row level security;
alter table public.favorites enable row level security;

create policy "places 읽기"   on public.places    for select using (true);
create policy "places 등록"   on public.places    for insert to authenticated with check (true);

create policy "reviews 읽기"  on public.reviews   for select using (true);
create policy "reviews 쓰기"  on public.reviews   for insert to authenticated with check (user_id = auth.uid() and not is_sample);
create policy "reviews 수정"  on public.reviews   for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and not is_sample);
create policy "reviews 삭제"  on public.reviews   for delete to authenticated using (user_id = auth.uid());

create policy "photos 읽기"   on public.photos    for select using (true);
create policy "photos 올리기" on public.photos    for insert to authenticated with check (user_id = auth.uid());
create policy "photos 삭제"   on public.photos    for delete to authenticated using (user_id = auth.uid());

create policy "favorites 읽기" on public.favorites for select using (true);
create policy "favorites 추가" on public.favorites for insert to authenticated with check (user_id = auth.uid());
create policy "favorites 해제" on public.favorites for delete to authenticated using (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- 4. 사진 저장소: 누구나 보기, 본인 폴더({place_id}/{user_id}/…)에만 올리기·지우기
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp']);

create policy "photos 버킷 올리기" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "photos 버킷 삭제" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[2] = auth.uid()::text);

-- ─────────────────────────────────────────────
-- 5. 시드: 송도 등록 장소 5곳 (기존 web/src/data/places.ts)
-- ─────────────────────────────────────────────
insert into public.places (id, name, category, group_code, address, phone, lat, lng) values
  ('775002048', '당산오돌 송도점',             '육류,고기', 'FD6', '인천 연수구 센트럴로 160',          '032-832-1218', 37.39181623951587, 126.64523848075555),
  ('939156377', '언양닭칼국수 송도점',         '칼국수',    'FD6', '인천 연수구 해돋이로 160-15',       '010-4181-4988', 37.3958393224301,  126.646153470478),
  ('27418261',  '진미옥콩나물해장국 송도본점', '국밥',      'FD6', '인천 연수구 컨벤시아대로130번길 14', '032-833-0444', 37.3929046600718,  126.644935221548),
  ('604749104', '카페꼼마 송도점',             '카페',      'CE7', '인천 연수구 센트럴로 263',          '032-719-7222', 37.3979601584889,  126.633965661604),
  ('26354443',  '경복궁 송도한옥마을점',       '경복궁',    'FD6', '인천 연수구 테크노파크로 180',      '032-834-2345', 37.39088421513732, 126.63886487344135);
