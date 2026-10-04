import KakaoMap from "@/components/KakaoMap";
import { PLACES } from "@/data/places";

export default function Home() {
  return (
    <main className="flex h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center px-4">
        <h1 className="text-lg font-bold text-primary">삼시세끼</h1>
      </header>
      <div className="min-h-0 flex-1">
        <KakaoMap places={PLACES} />
      </div>
    </main>
  );
}
