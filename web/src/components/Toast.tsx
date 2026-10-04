// 화면 가운데 위쪽에 잠깐 뜨는 알림 (한 줄 고정)
export default function Toast({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="absolute top-20 left-1/2 z-40 -translate-x-1/2 max-w-[calc(100%-2rem)] truncate rounded-full bg-ink px-4 py-2 text-sm whitespace-nowrap text-white shadow"
    >
      {message}
    </p>
  );
}
