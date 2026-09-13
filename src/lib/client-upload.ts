/**
 * Compresse une image côté navigateur pour rester sous la limite body.
 */
export async function compressImageForUpload(
  file: File | Blob,
  opts: { maxEdge?: number; quality?: number; maxBytes?: number; fileName?: string } = {},
): Promise<File> {
  const maxEdge = opts.maxEdge ?? 1100;
  const quality = opts.quality ?? 0.6;
  const maxBytes = opts.maxBytes ?? 700 * 1024;
  const inputName =
    opts.fileName ||
    (file instanceof File && file.name ? file.name : "photo.jpg");
  const inputType = file.type || "image/jpeg";

  if (inputType && !inputType.startsWith("image/") && inputType !== "") {
    throw new Error(
      "Format non supporté. Utilisez une photo JPEG ou PNG (pas HEIC/PDF).",
    );
  }

  if (
    file.size <= maxBytes &&
    inputType === "image/jpeg" &&
    file instanceof File
  ) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "Impossible de lire cette image. Exportez-la en JPEG et réessayez.",
    );
  }

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    if (file instanceof File) return file;
    return new File([file], inputName.replace(/\.\w+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let q = quality;
  let blob: Blob | null = null;
  for (let i = 0; i < 7; i++) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", q),
    );
    if (blob && blob.size <= maxBytes) break;
    q = Math.max(0.3, q - 0.07);
  }

  if (!blob || blob.size === 0) {
    throw new Error("Échec de la compression de la photo. Réessayez.");
  }

  const name = (inputName.replace(/\.\w+$/, "") || "photo") + ".jpg";
  return new File([blob], name, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export async function readJsonResponse<T = Record<string, unknown>>(
  res: Response,
): Promise<T> {
  const text = await res.text();
  if (!text) {
    throw new Error(
      `Le serveur n'a pas répondu correctement (HTTP ${res.status}). Réessayez avec une photo plus légère.`,
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Réponse serveur invalide (HTTP ${res.status}). Réessayez dans un instant.`,
    );
  }
}
