"""예시 사진·예시 찜 수 SQL 생성기 (seed_sample_reviews.py 다음에 실행할 SQL을 만든다).

- 사진: scripts/data/sample_photos.json (Wikimedia Commons의 자유 이용 사진: CC0·CC BY·CC BY-SA)
  실제 그 가게 사진이 아니라 비슷한 음식 사진이므로 is_sample = true, 출처(credit) 함께 저장
  사진은 리뷰 안에서만 보이므로 그 가게 예시 리뷰에 붙인다: 첫 리뷰에 2장(가로 넘기기), 이후 리뷰에 1장씩(가로로 꽉 차게)
- 찜 수: places.sample_favorite_count 에 숫자만 넣는다 (리뷰가 많을수록 많게)
- 0006 마이그레이션 실행 후, sample_reviews.sql 다음에 SQL Editor 에서 실행 (리뷰를 찾아 붙이므로 순서 중요)

실행: uv run scripts/seed_sample_extras.py
"""

import json
import random
from datetime import timedelta

from seed_sample_reviews import NOW, REVIEWS, ROOT, find_place, load_places, sql_str

PHOTOS_JSON = ROOT / "scripts/data/sample_photos.json"
OUT_SQL = ROOT / "supabase/seed/sample_photos_favorites.sql"
FAVORITES_PER_REVIEW = 3  # 예시 찜 수 ≈ 리뷰 수 × 3 + 약간의 흔들림


def main() -> None:
    rng = random.Random(20261005)
    collected = load_places()

    def find_id(key: str) -> str:
        return find_place(key, collected)[0]

    photos = json.loads(PHOTOS_JSON.read_text(encoding="utf-8"))
    photo_rows = []
    for key, items in photos.items():
        place_id = find_id(key)
        reviews = REVIEWS[key]
        for i, photo in enumerate(items):
            review = reviews[min(max(i - 1, 0), len(reviews) - 1)]
            review_id = (
                f"(select id from public.reviews where place_id = {sql_str(place_id)} "
                f"and is_sample and comment = {sql_str(review['comment'])})"
            )
            artist = photo["artist"] if photo["artist"] not in ("", "me") else "Wikimedia Commons"  # 'me' = 올린 사람이 이름 대신 적은 값
            credit = f"{artist} · {photo['license']}"
            created_at = NOW - timedelta(
                days=60 - i
            )  # 목록 첫 사진이 대표 사진이 되도록 오래된 순서
            photo_rows.append(
                f"  ({sql_str(place_id)}, {review_id}, null, {sql_str(photo['url'].split('?')[0])}, true, {sql_str(credit)}, {sql_str(created_at.isoformat())})"
            )

    favorite_rows = [
        f"update public.places set sample_favorite_count = {len(reviews) * FAVORITES_PER_REVIEW + rng.randint(0, 5)} where id = {sql_str(find_id(key))};"
        for key, reviews in REVIEWS.items()
        if reviews
    ]

    OUT_SQL.write_text(
        f"""-- 예시 사진 {len(photo_rows)}장 + 예시 찜 수 (scripts/seed_sample_extras.py 로 생성, 직접 고치지 말 것)
-- 0006 마이그레이션과 sample_reviews.sql 다음에 실행 (예시 리뷰에 붙임). 다시 실행해도 예시 사진은 지우고 새로 넣는다. 지우기: 맨 아래 주석.

delete from public.photos where is_sample;

insert into public.photos (place_id, review_id, user_id, path, is_sample, credit, created_at) values
{",\n".join(photo_rows)};

{chr(10).join(favorite_rows)}

-- 지우기:
-- delete from public.photos where is_sample;
-- update public.places set sample_favorite_count = 0;
""",
        encoding="utf-8",
        newline="\n",
    )
    print(
        f"{OUT_SQL.relative_to(ROOT)}: 사진 {len(photo_rows)}장, 찜 수 {len(favorite_rows)}곳"
    )


if __name__ == "__main__":
    main()
