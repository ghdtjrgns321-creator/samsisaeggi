// 익명 로그인: 쓰기(찜·리뷰·사진)가 필요할 때 로그인 상태를 보장한다.
// 세션은 브라우저에 저장되어 다음 방문에도 같은 계정을 쓴다. 읽기만 하는 방문자는 계정을 만들지 않는다.
import { supabase } from "./client";

let pending: Promise<string> | null = null; // 동시에 여러 번 불려도 계정은 하나만 만들기

/** 로그인된 계정 id. 없으면 익명 계정을 만든다 */
export function ensureUserId(): Promise<string> {
  pending ??= (async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session.user.id;

    const { data: signIn, error } = await supabase.auth.signInAnonymously();
    if (error || !signIn.user) throw new Error(`로그인 실패: ${error?.message ?? "알 수 없는 오류"}`);
    return signIn.user.id;
  })().catch((e) => {
    pending = null; // 실패하면 다음 호출에서 다시 시도
    throw e;
  });
  return pending;
}

/** 이미 로그인돼 있으면 계정 id, 아니면 null (계정을 새로 만들지 않음) */
export async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}
