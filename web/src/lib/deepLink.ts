// 공유 링크(?place=id)로 들어왔을 때 열 장소 id
export function getLinkedPlaceId(): string | null {
  return new URLSearchParams(window.location.search).get("place");
}
