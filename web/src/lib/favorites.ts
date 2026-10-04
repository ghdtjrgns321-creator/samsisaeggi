// 찜 목록: 로그인이 없으므로 이 브라우저(localStorage)에만 저장.
// 사생활 보호 모드 등에서 저장소가 막혀도 앱은 동작해야 하므로 실패는 빈 목록으로 처리.

const KEY = "samsisaeggi:favorites";

export function loadFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function isFavorite(placeId: string): boolean {
  return loadFavorites().includes(placeId);
}

/** 찜 상태를 뒤집고, 바뀐 상태를 돌려준다 */
export function toggleFavorite(placeId: string): boolean {
  const current = loadFavorites();
  const next = current.includes(placeId) ? current.filter((id) => id !== placeId) : [...current, placeId];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 저장 실패 시 화면 상태만 바뀌고 새로고침하면 사라짐
  }
  return next.includes(placeId);
}
