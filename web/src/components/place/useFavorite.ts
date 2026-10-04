"use client";

// 찜 버튼 상태: 내가 찜했는지(DB에서 읽음) + 화면에 보일 찜 수.
// 누르면 화면을 먼저 바꾸고(±1) DB에 저장, 실패하면 되돌린다. 저장 뒤 onChanged로 서버 숫자를 다시 받는다.
import { useEffect, useState } from "react";
import type { PlaceBase } from "@/types/place";
import { isFavorited, setFavorite as saveFavorite } from "@/lib/db/favorites";

export function useFavorite(place: PlaceBase, serverCount: number, onChanged: () => void, onError: (msg: string) => void) {
  const [favorite, setFavorite] = useState(false);
  const [saving, setSaving] = useState(false);
  // 서버 숫자(serverCount)가 내 찜 상태 favoriteAtBase 기준일 때의 값. 화면 숫자 = 서버 숫자 + 그 뒤 내 변화
  const [base, setBase] = useState({ count: serverCount, favorite: false });

  useEffect(() => {
    isFavorited(place.id)
      .then((fav) => {
        setFavorite(fav);
        setBase((b) => ({ ...b, favorite: fav }));
      })
      .catch((e: Error) => onError(e.message));
  }, [place.id, onError]);

  // 서버 숫자가 새로 오면 그 숫자에 내 최신 상태가 이미 반영돼 있으므로 기준을 옮긴다
  if (serverCount !== base.count) setBase({ count: serverCount, favorite });

  const toggle = async () => {
    if (saving) return;
    const next = !favorite;
    setFavorite(next);
    setSaving(true);
    try {
      await saveFavorite(place, next);
      onChanged();
    } catch (e) {
      setFavorite(!next);
      onError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const count = base.count + Number(favorite) - Number(base.favorite);
  return { favorite, count, toggle };
}
