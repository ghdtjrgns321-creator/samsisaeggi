// 올리기 전 사진 줄이기: 긴 변 MAX_SIDE px, JPEG. 휴대폰 원본(수 MB)이 저장소 한도(5MB)를 넘지 않게 하고 로딩도 빠르게.
const MAX_SIDE = 1600;
const QUALITY = 0.85;

export async function shrinkImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file); // 휴대폰 사진의 회전 정보(EXIF)를 반영해 읽음
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("사진을 변환하지 못했어요"))), "image/jpeg", QUALITY),
  );
}
