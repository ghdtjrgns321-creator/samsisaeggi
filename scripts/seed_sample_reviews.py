"""예시 리뷰 SQL 생성기.

scripts/data/sample_places.json(Kakao에서 모은 송도 실제 장소) + DB에 이미 있는 송도 5곳에
예시 리뷰를 만들어 supabase/seed/sample_reviews.sql 로 쓴다. Supabase SQL Editor에서 실행.

- 실제 가게라 별점은 3~5, 한줄평은 긍정·중립만 (is_sample = true 로 표시)
- 화면 확인용으로 여러 경우를 섞는다: 리뷰 많은 곳/1개/0개, 선택 항목 있음/없음, 회식 대인원, 카페 작업 환경
- 고정 시드라 다시 실행해도 같은 결과

실행: uv run scripts/seed_sample_reviews.py
"""

import json
import random
from datetime import UTC, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLACES_JSON = ROOT / "scripts/data/sample_places.json"
OUT_SQL = ROOT / "supabase/seed/sample_reviews.sql"
EXCLUDE_NAMES = {"벌툰"}  # 이름에 포함되면 제외 (만화카페: 작업카페 성격과 다름)
OPTIONAL_SKIP_RATE = (
    0.3  # 선택 항목을 비워 두는 비율 (리뷰 작성 부담 완화 → 실제로도 빈 칸이 생김)
)
NOW = datetime(2026, 10, 4, 12, 0, tzinfo=UTC)

# 장소별 성격: 리뷰 수, 별점 범위, 시간대·용도 후보, 인원·1인 가격 범위, 한줄평 묶음
PROFILES = {
    "회식": dict(
        meal=["회식", "저녁"],
        purposes=["팀", "동기"],
        people=(6, 14),
        price=(25000, 38000),
    ),
    "점심": dict(
        meal=["점심"],
        purposes=["혼밥", "동기", "팀"],
        people=(1, 5),
        price=(9000, 12000),
    ),
    "혼밥": dict(
        meal=["점심", "저녁"], purposes=["혼밥"], people=(1, 2), price=(8000, 11000)
    ),
    "접대": dict(
        meal=["점심", "저녁"],
        purposes=["클라이언트", "팀"],
        people=(3, 8),
        price=(30000, 55000),
    ),
    "일반": dict(
        meal=["점심", "저녁"],
        purposes=["동기", "혼밥", "팀"],
        people=(1, 6),
        price=(10000, 18000),
    ),
    "카페": dict(
        meal=[], purposes=["작업", "미팅", "휴식"], people=(1, 3), price=(5000, 8000)
    ),
}

COMMENTS = {
    "회식": [
        "룸 있어 회식하기 좋아요. 예약 필수!",
        "고기 질 좋고 직원분들이 구워줘요",
        "12명도 넉넉히 앉았어요",
        "팀 회식으로 무난해요",
        "가격대 있지만 만족스러운 회식",
    ],
    "점심": [
        "점심에 빨리 나와서 좋아요",
        "국물이 진하고 양 많아요",
        "점심 웨이팅 10분 정도",
        "동기들이랑 가기 딱 좋아요",
        "가성비 좋은 점심 맛집",
    ],
    "혼밥": [
        "혼밥하기 편한 자리 많아요",
        "해장으로 최고예요",
        "아침 일찍 열어서 출장 때 좋아요",
        "혼자 가도 눈치 안 보여요",
    ],
    "접대": [
        "클라이언트 모시기 좋은 분위기",
        "조용해서 미팅 겸 식사 가능",
        "코스 구성이 깔끔해요",
        "격식 있는 자리로 추천",
    ],
    "일반": [
        "무난하게 맛있어요",
        "재방문 의사 있어요",
        "생각보다 괜찮았어요",
        "깔끔하고 친절해요",
        "메뉴가 다양해서 고르기 좋아요",
    ],
    "카페": [
        "콘센트 많아서 작업하기 좋아요",
        "자리 넓고 조용해요",
        "와이파이 빠르고 오래 있기 편함",
        "커피 맛 괜찮고 좌석 넉넉",
        "미팅하기 좋은 테이블 있어요",
    ],
}
WORK_ENV = ["콘센트", "와이파이", "조용함", "좌석 넉넉"]

# (장소 이름에 포함된 글자, 성격, 리뷰 수, 별점 범위)
PLAN = [
    ("당산오돌", "회식", 9, (4, 5)),
    ("언양닭칼국수", "점심", 7, (4, 5)),
    ("진미옥", "혼밥", 6, (3, 5)),
    ("카페꼼마", "카페", 6, (4, 5)),
    ("경복궁", "접대", 4, (4, 5)),
    ("오마카세", "접대", 3, (4, 5)),
    ("코지하우스", "일반", 3, (3, 5)),
    ("최고당돈가스", "점심", 3, (4, 5)),
    ("후후쌀국수", "점심", 2, (3, 4)),
    ("엽기떡볶이", "일반", 1, (4, 4)),
    ("가회동샤브", "일반", 2, (4, 5)),
    ("샹끄발레르", "일반", 1, (5, 5)),
    ("브런치빈", "카페", 2, (3, 5)),
    ("질마재", "회식", 1, (5, 5)),
    (
        "영미화김밥",
        "혼밥",
        0,
        (4, 5),
    ),  # 등록만 되고 리뷰 0개 → "첫 리뷰를 남겨주세요" 화면 확인용
    ("움버거", "일반", 0, (4, 5)),
]

# DB에 이미 들어 있는 송도 5곳 (supabase/migrations/0001_init.sql 시드)
EXISTING = {
    "당산오돌": "775002048",
    "언양닭칼국수": "939156377",
    "진미옥": "27418261",
    "카페꼼마": "604749104",
    "경복궁": "26354443",
}


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def sql_array(values: list[str]) -> str:
    return (
        "array[" + ", ".join(sql_str(v) for v in values) + "]::text[]"
        if values
        else "'{}'::text[]"
    )


def maybe(rng: random.Random, value):
    return None if rng.random() < OPTIONAL_SKIP_RATE else value


def make_review(
    rng: random.Random, place_id: str, kind: str, rating_range: tuple[int, int]
) -> str:
    profile = PROFILES[kind]
    is_cafe = kind == "카페"
    rating = rng.randint(*rating_range)
    comment = rng.choice(COMMENTS[kind])
    purposes = maybe(
        rng,
        rng.sample(
            profile["purposes"], k=rng.randint(1, min(2, len(profile["purposes"])))
        ),
    )
    meal_time = None if is_cafe else maybe(rng, rng.choice(profile["meal"]))
    work_env = (
        maybe(rng, rng.sample(WORK_ENV, k=rng.randint(1, 3))) if is_cafe else None
    )
    people = maybe(rng, rng.randint(*profile["people"]))
    per_person = rng.randrange(profile["price"][0], profile["price"][1] + 1, 500)
    total_price = maybe(rng, per_person * people) if people else None
    created_at = NOW - timedelta(days=rng.randint(0, 60), hours=rng.randint(0, 23))

    def opt(v, fmt):
        return "null" if v is None else fmt(v)

    return (
        f"  ({sql_str(place_id)}, null, {rating}, {sql_str(comment)}, {sql_array(purposes or [])}, "
        f"{opt(meal_time, sql_str)}, {sql_array(work_env or [])}, {opt(people, str)}, {opt(total_price, str)}, "
        f"true, {sql_str(created_at.isoformat())})"
    )


def main() -> None:
    rng = random.Random(20261004)
    collected = [
        p
        for p in json.loads(PLACES_JSON.read_text(encoding="utf-8"))
        if not any(x in p["name"] for x in EXCLUDE_NAMES)
    ]

    def find_id(key: str) -> str:
        if key in EXISTING:
            return EXISTING[key]
        match = next((p for p in collected if key in p["name"]), None)
        if match is None:
            raise SystemExit(f"sample_places.json에 '{key}' 장소가 없어요")
        return match["id"]

    new_places = [p for p in collected if any(key in p["name"] for key, *_ in PLAN)]
    place_rows = ",\n".join(
        f"  ({sql_str(p['id'])}, {sql_str(p['name'])}, {sql_str(p['category'])}, {sql_str(p['group_code'])}, "
        f"{sql_str(p['address'])}, {sql_str(p['phone'])}, {p['lat']}, {p['lng']})"
        for p in new_places
    )
    review_rows = ",\n".join(
        make_review(rng, find_id(key), kind, rating_range)
        for key, kind, count, rating_range in PLAN
        for _ in range(count)
    )
    review_total = sum(count for _, _, count, _ in PLAN)

    OUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    OUT_SQL.write_text(
        f"""-- 예시 리뷰 {review_total}개 + 송도 장소 {len(new_places)}곳 (scripts/seed_sample_reviews.py 로 생성, 직접 고치지 말 것)
-- Supabase SQL Editor 에서 실행. 지우기: 맨 아래 주석의 delete 문 실행.

insert into public.places (id, name, category, group_code, address, phone, lat, lng) values
{place_rows}
on conflict (id) do nothing;

insert into public.reviews (place_id, user_id, rating, comment, purposes, meal_time, work_env, people, total_price, is_sample, created_at) values
{review_rows};

-- 지우기:
-- delete from public.reviews where is_sample;
-- delete from public.places p where p.id in ({", ".join(sql_str(p["id"]) for p in new_places)})
--   and not exists (select 1 from public.reviews r where r.place_id = p.id)
--   and not exists (select 1 from public.favorites f where f.place_id = p.id);
""",
        encoding="utf-8",
        newline="\n",
    )
    print(
        f"{OUT_SQL.relative_to(ROOT)}: 리뷰 {review_total}개, 새 장소 {len(new_places)}곳"
    )


if __name__ == "__main__":
    main()
