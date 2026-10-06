"""예시 리뷰 SQL 생성기.

scripts/data/sample_reviews.json(가게별로 직접 쓴 예시 리뷰)을 supabase/seed/sample_reviews.sql 로 바꾼다.
장소는 scripts/data/sample_places.json(Kakao에서 모은 송도·용산 실제 장소) + DB에 이미 있는 송도 5곳. Supabase SQL Editor에서 실행.

- 리뷰는 가게 메뉴에 맞춰 손으로 쓴다. 별점과 내용이 맞아야 하고, 아쉬움은 웨이팅·소음·가격처럼 가벼운 것까지만
- 화면 확인용으로 여러 경우를 섞는다: 리뷰 많은 곳/1개/0개, 선택 항목 있음/없음, 회식 대인원, 카페 작업 환경
- 작성 시각만 고정 시드로 흩뿌린다 → 다시 실행해도 같은 결과

실행: uv run scripts/seed_sample_reviews.py
"""

import json
import random
from datetime import UTC, datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLACES_JSON = ROOT / "scripts/data/sample_places.json"
REVIEWS_JSON = ROOT / "scripts/data/sample_reviews.json"
OUT_SQL = ROOT / "supabase/seed/sample_reviews.sql"
EXCLUDE_NAMES = {"벌툰"}  # 이름에 포함되면 제외 (만화카페: 작업카페 성격과 다름)
NOW = datetime(2026, 10, 4, 12, 0, tzinfo=UTC)
COMMENT_MAX = 30  # 예시 한줄평 길이 기준 (DB 상한은 500자)

# 리뷰 작성 화면의 선택지 (supabase/migrations/0001_init.sql 주석과 같음)
PURPOSES = {"FD6": {"혼밥", "동기", "팀", "클라이언트"}, "CE7": {"작업", "미팅", "휴식"}}
MEAL_TIMES = {"점심", "저녁", "회식"}
WORK_ENV = {"콘센트", "와이파이", "조용함", "좌석 넉넉"}

# DB에 이미 들어 있는 송도 5곳 (supabase/migrations/0001_init.sql 시드)
EXISTING = {
    "당산오돌": ("775002048", "FD6"),
    "언양닭칼국수": ("939156377", "FD6"),
    "진미옥": ("27418261", "FD6"),
    "카페꼼마": ("604749104", "CE7"),
    "경복궁": ("26354443", "FD6"),
}

# {장소 이름에 포함된 글자: [리뷰, ...]} — 빈 목록 = 등록만 되고 리뷰 0개 ("첫 리뷰를 남겨주세요" 화면 확인용)
REVIEWS: dict[str, list[dict]] = json.loads(REVIEWS_JSON.read_text(encoding="utf-8"))


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def sql_array(values: list[str]) -> str:
    return (
        "array[" + ", ".join(sql_str(v) for v in values) + "]::text[]"
        if values
        else "'{}'::text[]"
    )


def load_places() -> list[dict]:
    places = [
        p
        for p in json.loads(PLACES_JSON.read_text(encoding="utf-8"))
        if not any(x in p["name"] for x in EXCLUDE_NAMES)
    ]
    # 빵집은 카페로 본다 (앱 규칙과 같음: web/src/lib/kakao/placeSearch.ts toPlaceBase)
    for p in places:
        if p["category"] == "제과,베이커리":
            p["group_code"] = "CE7"
    return places


def find_place(key: str, collected: list[dict]) -> tuple[str, str]:
    """(Kakao id, 분류 코드)"""
    if key in EXISTING:
        return EXISTING[key]
    matches = [p for p in collected if key in p["name"]]
    if len(matches) != 1:
        raise SystemExit(f"sample_places.json에 '{key}' 장소가 {len(matches)}곳이에요 (1곳이어야 함)")
    return matches[0]["id"], matches[0]["group_code"]


def check_review(key: str, group_code: str, r: dict) -> None:
    """DB 제약·작성 화면 선택지와 어긋나면 SQL 실행 전에 멈춘다"""
    problems = []
    if not 1 <= r["rating"] <= 5:
        problems.append("별점은 1~5")
    if not 1 <= len(r["comment"]) <= COMMENT_MAX:
        problems.append(f"한줄평 {len(r['comment'])}자 (최대 {COMMENT_MAX})")
    if not set(r.get("purposes", [])) <= PURPOSES[group_code]:
        problems.append(f"용도 {r['purposes']}")
    if group_code == "CE7" and r.get("meal_time"):
        problems.append("카페에는 시간대 없음")
    if r.get("meal_time") not in MEAL_TIMES | {None}:
        problems.append(f"시간대 {r['meal_time']}")
    if group_code == "FD6" and r.get("work_env"):
        problems.append("음식점에는 작업 환경 없음")
    if not set(r.get("work_env", [])) <= WORK_ENV:
        problems.append(f"작업 환경 {r['work_env']}")
    if r.get("total_price") is not None and r.get("people") is None:
        problems.append("총 가격만 있고 인원 없음 (1인 가격 계산 불가)")
    if problems:
        raise SystemExit(f"{key} '{r['comment']}': " + ", ".join(problems))


def review_row(rng: random.Random, place_id: str, r: dict) -> str:
    created_at = NOW - timedelta(days=rng.randint(0, 60), hours=rng.randint(0, 23))

    def opt(v, fmt):
        return "null" if v is None else fmt(v)

    return (
        f"  ({sql_str(place_id)}, null, {r['rating']}, {sql_str(r['comment'])}, {sql_array(r.get('purposes', []))}, "
        f"{opt(r.get('meal_time'), sql_str)}, {sql_array(r.get('work_env', []))}, {opt(r.get('people'), str)}, "
        f"{opt(r.get('total_price'), str)}, true, {sql_str(created_at.isoformat())})"
    )


def main() -> None:
    rng = random.Random(20261004)
    collected = load_places()

    review_rows = []
    for key, reviews in REVIEWS.items():
        place_id, group_code = find_place(key, collected)
        for r in reviews:
            check_review(key, group_code, r)
            review_rows.append(review_row(rng, place_id, r))

    new_places = [p for p in collected if any(key in p["name"] for key in REVIEWS)]
    place_rows = ",\n".join(
        f"  ({sql_str(p['id'])}, {sql_str(p['name'])}, {sql_str(p['category'])}, {sql_str(p['group_code'])}, "
        f"{sql_str(p['address'])}, {sql_str(p['phone'])}, {p['lat']}, {p['lng']})"
        for p in new_places
    )

    OUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    OUT_SQL.write_text(
        f"""-- 예시 리뷰 {len(review_rows)}개 + 송도·용산 장소 {len(new_places)}곳 (scripts/seed_sample_reviews.py 로 생성, 직접 고치지 말 것)
-- Supabase SQL Editor 에서 실행. 기존 예시 리뷰를 지우고 새로 넣는다 (사용자가 쓴 리뷰는 그대로).

delete from public.reviews where is_sample;

insert into public.places (id, name, category, group_code, address, phone, lat, lng) values
{place_rows}
on conflict (id) do nothing;

insert into public.reviews (place_id, user_id, rating, comment, purposes, meal_time, work_env, people, total_price, is_sample, created_at) values
{",\n".join(review_rows)};

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
        f"{OUT_SQL.relative_to(ROOT)}: 리뷰 {len(review_rows)}개, 새 장소 {len(new_places)}곳"
    )


if __name__ == "__main__":
    main()
