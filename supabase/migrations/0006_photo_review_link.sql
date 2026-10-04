-- 리뷰에 붙인 사진을 그 리뷰 아래에도 보여주기 위해 사진 → 리뷰 연결 칸 추가.
-- SQL Editor 에서 0005 다음에 실행. 예시 사진은 리뷰와 무관해 null. 리뷰를 지우면 그 리뷰 사진 행도 지운다.
alter table public.photos add column review_id uuid references public.reviews (id) on delete cascade;
create index photos_review_id_idx on public.photos (review_id);
