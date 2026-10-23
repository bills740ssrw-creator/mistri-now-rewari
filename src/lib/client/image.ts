"use client";

/**
 * Downscales + compresses a photo in the browser before upload. Keeps payloads
 * small (usually 80–250 KB) which keeps bookings fast on Rewari's mobile
 * networks and well under Supabase's storage/action limits.
 */
export async function compressImageFile(
  file: File,
  options: { maxDim?: number; quality?: number } = {},
): Promise<string> {
  const { maxDim = 1280, quality = 0.76 } = options;

  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("That photo is larger than 12 MB. Please choose a smaller one.");
  }

  const dataUrl = await readFile(file);
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, maxDim / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That image could not be opened."));
    image.src = src;
  });
}
