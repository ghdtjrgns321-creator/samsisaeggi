-- 빵집(Kakao 분류 '제과,베이커리')을 카페로 옮긴다. 앱도 같은 규칙으로 분류 (web/src/lib/kakao/placeSearch.ts toPlaceBase).
-- SQL Editor 에서 0003 다음에 실행. 카페에는 시간대가 없으므로 이미 달린 리뷰의 시간대는 지운다.
update public.places set group_code = 'CE7' where category = '제과,베이커리' and group_code = 'FD6';

update public.reviews r set meal_time = null
from public.places p
where r.place_id = p.id and p.category = '제과,베이커리' and r.meal_time is not null;
