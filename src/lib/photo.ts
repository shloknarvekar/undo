/**
 * Browser-side photo preparation, shared by the undo form on the computer and the phone handoff page.
 * Phone photos are often 5–10 MB: they are downscaled to ≤1600px JPEG before hashing, signing and upload.
 */
export async function preparePhoto(file: File): Promise<{ dataUrl: string; bytes: ArrayBuffer }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", 0.85));
  return { dataUrl: await blobToDataUrl(blob), bytes: await blob.arrayBuffer() };
}

/** The bytes behind a data URL, so the computer hashes exactly what it received. */
export async function dataUrlBytes(dataUrl: string): Promise<ArrayBuffer> {
  return (await fetch(dataUrl)).arrayBuffer();
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });
}
