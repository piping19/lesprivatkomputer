/**
 * Utilitas gambar untuk panel admin (client-side).
 *
 * Gambar yang diupload admin otomatis diperkecil di browser (sisi klien)
 * menjadi JPEG maksimal `maxWidth` px sebelum dikirim ke server, agar:
 * - hemat kuota database Neon (data URL kecil)
 * - website tetap cepat dimuat
 */

const MAX_WIDTH = 800;
const JPEG_QUALITY = 0.78;
/** Batas ukuran data URL hasil (±600 KB) */
export const MAX_IMAGE_DATA_URL_LENGTH = 600_000;

export async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser tidak mendukung pemrosesan gambar");

  // Isi latar putih agar gambar transparan (PNG) tidak menjadi hitam
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
