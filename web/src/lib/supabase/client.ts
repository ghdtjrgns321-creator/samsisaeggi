// Supabase 연결 (브라우저에서 직접 사용, 공개용 publishable 키). 권한은 DB의 RLS 규칙이 막는다.
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
