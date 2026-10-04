"use client";

// 리뷰 작성 화면 (디자인 보드 02-2). 화면 전체를 덮고, PC에서는 가운데 상자.
// 필수: 별점(0.5 단위)·한줄평 / 선택: 사진(최대 5장)·종류별 태그(음식점 = 시간대·용도, 카페 = 용도·작업 환경)·방문 인원·총 가격.
// 지도 화면의 겹침 순서에 묶이지 않도록 body에 바로 띄우고, 저장 오류는 폼 안에 보여준다(토스트가 폼 뒤에 가려짐).
import { useState } from "react";
import { createPortal } from "react-dom";
import type { PlaceBase } from "@/types/place";
import { tagGroupsFor, type FilterKey } from "@/lib/filters";
import { createReview } from "@/lib/db/reviews";
import { uploadReviewPhotos } from "@/lib/db/photos";
import ChipSelect from "./ChipSelect";
import PeoplePrice from "./PeoplePrice";
import PhotoPicker, { MAX_PHOTOS } from "./PhotoPicker";
import StarRating from "./StarRating";

const COMMENT_MAX = 500; // DB 제약 (남용 방지용 상한, 화면엔 표시 안 함)

type TagKey = Exclude<FilterKey, "kind">;
const EMPTY_TAGS: Record<TagKey, string[]> = { mealTime: [], purpose: [], workEnv: [] };

type Props = {
  place: PlaceBase;
  onClose: () => void;
  onSaved: (message: string) => void;
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line px-5 py-4">
      <h3 className="mb-3 text-sm font-bold">
        {label} {hint && <span className="text-xs font-normal text-gray">{hint}</span>}
      </h3>
      {children}
    </section>
  );
}

export default function ReviewForm({ place, onClose, onSaved }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState(EMPTY_TAGS);
  const [people, setPeople] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const groups = tagGroupsFor(place.groupCode);
  const trimmed = comment.trim();
  const canSubmit = rating > 0 && trimmed.length > 0 && !saving;
  const dirty = rating > 0 || comment !== "" || Object.values(tags).some((t) => t.length > 0) || people !== null || totalPrice !== null || photos.length > 0;

  const toggleTag = (key: TagKey, value: string) =>
    setTags((prev) => {
      const cur = prev[key];
      if (cur.includes(value)) return { ...prev, [key]: cur.filter((v) => v !== value) };
      return { ...prev, [key]: key === "mealTime" ? [value] : [...cur, value] }; // 시간대는 하나만
    });

  const handleClose = () => {
    if (dirty && !window.confirm("작성 중인 리뷰를 버릴까요?")) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    let reviewId: string;
    try {
      reviewId = await createReview(place, {
        rating,
        comment: trimmed,
        purposes: tags.purpose,
        mealTime: tags.mealTime[0] ?? null,
        workEnv: tags.workEnv,
        people,
        totalPrice,
      });
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
      return;
    }
    // 리뷰는 이미 저장됨: 사진이 실패해도 폼을 닫는다 (다시 등록하면 리뷰가 두 번 생기므로)
    const failed = photos.length ? await uploadReviewPhotos(place.id, reviewId, photos).catch(() => photos.length) : 0;
    onSaved(failed ? `리뷰는 남겼지만 사진 ${failed}장을 올리지 못했어요` : "리뷰를 남겼어요");
  };

  return createPortal(
    <div data-modal className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        role="dialog"
        aria-label="리뷰 남기기"
        className="flex h-full w-full flex-col bg-white lg:h-[min(760px,90vh)] lg:max-w-[420px] lg:rounded-2xl lg:overflow-hidden"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-line px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
          <button type="button" onClick={handleClose} aria-label="닫기" className="h-9 w-9 text-xl">
            ✕
          </button>
          <div className="min-w-0">
            <h2 className="text-base font-bold">리뷰 남기기</h2>
            <p className="truncate text-xs text-gray">{place.name}</p>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Field label="별점" hint="필수">
            <StarRating value={rating} onChange={setRating} />
          </Field>

          <Field label="한줄 리뷰" hint="필수">
            <textarea
              value={comment}
              maxLength={COMMENT_MAX}
              rows={3}
              onChange={(e) => setComment(e.target.value)}
              placeholder="예: 빨리 나와요. 점심 강추!"
              className="w-full resize-none rounded-lg border border-line px-3 py-2.5 text-sm"
            />
          </Field>

          <Field label="사진" hint={`선택 · 최대 ${MAX_PHOTOS}장`}>
            <PhotoPicker files={photos} onChange={setPhotos} />
          </Field>

          {groups.map((g) => (
            <Field key={g.key} label={g.label} hint={g.key === "mealTime" ? "선택" : "선택 · 여러 개"}>
              <ChipSelect options={g.options} selected={tags[g.key as TagKey]} onToggle={(v) => toggleTag(g.key as TagKey, v)} />
            </Field>
          ))}

          <Field label="방문 인원 · 가격" hint="선택">
            <PeoplePrice people={people} totalPrice={totalPrice} onPeople={setPeople} onTotalPrice={setTotalPrice} />
          </Field>
        </div>

        <footer className="shrink-0 border-t border-line px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {error && <p className="mb-2 text-xs text-primary">{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full rounded-xl bg-primary py-3.5 text-base font-bold text-white disabled:bg-line disabled:text-gray"
          >
            {saving ? (photos.length ? "사진 올리는 중…" : "저장 중…") : "등록하기"}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
