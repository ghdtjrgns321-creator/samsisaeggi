"use client";

// 등록 장소를 DB에서 불러온다. 리뷰·찜을 바꾼 뒤 reload()로 다시 읽는다.
// places === null 은 아직 불러오는 중. 불러올 때마다 onLoaded.
import { useCallback, useEffect, useState } from "react";
import type { Place } from "@/types/place";
import { fetchRegisteredPlaces } from "@/lib/db/places";

export function useRegisteredPlaces(onError: (msg: string) => void, onLoaded: (places: Place[]) => void) {
  const [places, setPlaces] = useState<Place[] | null>(null);

  const reload = useCallback(
    () =>
      fetchRegisteredPlaces()
        .then((ps) => {
          setPlaces(ps);
          onLoaded(ps);
        })
        .catch((e: Error) => {
          setPlaces((prev) => prev ?? []); // 실패해도 지도는 쓸 수 있게
          onError(e.message);
        }),
    [onError, onLoaded],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { places, reload };
}
