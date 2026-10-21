import "server-only";
import { getStorageAdmin } from "@/lib/supabase-storage";
import { safeWebUrl } from "@/lib/public-content";

export const EBOOK_BUCKET = "learning-books";
export const EBOOK_MAX_SIZE = 20 * 1024 * 1024;
export const EBOOK_REFERENCE = `storage://${EBOOK_BUCKET}/`;
const PATH_PATTERN = /^ebooks\/[a-zA-Z0-9_-]+\/[0-9a-f-]{36}\.pdf$/;

export class InvalidEbookError extends Error {}

async function ensureEbookBucket() {
  const storage = getStorageAdmin().storage;
  let { data, error } = await storage.getBucket(EBOOK_BUCKET);
  if (error?.statusCode === "404") {
    const result = await storage.createBucket(EBOOK_BUCKET, { public: false, fileSizeLimit: EBOOK_MAX_SIZE, allowedMimeTypes: ["application/pdf"] });
    if (result.error && result.error.statusCode !== "409") throw result.error;
    ({ data, error } = await storage.getBucket(EBOOK_BUCKET));
  }
  if (error) throw error;
  if (!data || data.public) throw new Error("Bucket e-book harus private.");
}

export async function createEbookUploadToken(userId: string) {
  await ensureEbookBucket();
  const path = `ebooks/${userId}/${crypto.randomUUID()}.pdf`;
  const { data, error } = await getStorageAdmin().storage.from(EBOOK_BUCKET).createSignedUploadUrl(path);
  if (error) throw error;
  return { bucket: EBOOK_BUCKET, path: data.path, token: data.token };
}

// Only an attached module PDF can be read publicly. Student media stays private.
export async function validateEbookReference(reference: string | null, userId: string, previous?: string | null) {
  if (!reference) return null;
  if (!reference.startsWith(EBOOK_REFERENCE)) {
    const url = safeWebUrl(reference);
    if (!url || new URL(url).protocol !== "https:") throw new InvalidEbookError("Gunakan tautan PDF HTTPS yang valid.");
    return url;
  }
  const path = reference.slice(EBOOK_REFERENCE.length);
  if (!PATH_PATTERN.test(path)) throw new InvalidEbookError("Referensi e-book tidak valid.");
  if (reference === previous) return reference;
  if (!path.startsWith(`ebooks/${userId}/`)) throw new InvalidEbookError("Unggah e-book melalui akun Anda.");
  const slash = path.lastIndexOf("/");
  const { data, error } = await getStorageAdmin().storage.from(EBOOK_BUCKET).list(path.slice(0, slash), { search: path.slice(slash + 1), limit: 10 });
  if (error) throw error;
  const file = data.find((item) => item.name === path.slice(slash + 1));
  if (!file || file.metadata?.mimetype !== "application/pdf" || !(file.metadata?.size > 0) || file.metadata.size > EBOOK_MAX_SIZE) throw new InvalidEbookError("PDF belum terunggah atau melebihi batas 20 MB.");
  return reference;
}

export async function getEbookUrl(reference: string, downloadName?: string) {
  if (!reference.startsWith(EBOOK_REFERENCE)) return safeWebUrl(reference);
  const path = reference.slice(EBOOK_REFERENCE.length);
  if (!PATH_PATTERN.test(path)) return null;
  const { data, error } = await getStorageAdmin().storage.from(EBOOK_BUCKET).createSignedUrl(path, 3600, downloadName ? { download: downloadName } : undefined);
  if (error) throw error;
  return data.signedUrl;
}
