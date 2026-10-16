import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const MEDIA_BUCKET = "school-media";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

let adminClient: SupabaseClient | undefined;

function getStorageAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus disetel untuk mengakses Supabase Storage.",
    );
  }
  adminClient ??= createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}

export async function ensureMediaBucket(): Promise<void> {
  const storage = getStorageAdmin().storage;
  const { data: bucket, error } = await storage.getBucket(MEDIA_BUCKET);
  if (!error) {
    if (bucket.public) {
      throw new Error(`Bucket ${MEDIA_BUCKET} harus bersifat private.`);
    }
    return;
  }
  if (error.statusCode !== "404") {
    throw error;
  }

  const { error: createError } = await storage.createBucket(MEDIA_BUCKET, {
    public: false,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/ogg",
      "video/x-msvideo",
    ],
  });
  if (createError && createError.statusCode !== "409") {
    throw createError;
  }

  const { data: createdBucket, error: verifyError } =
    await storage.getBucket(MEDIA_BUCKET);
  if (verifyError) throw verifyError;
  if (createdBucket.public) {
    throw new Error(`Bucket ${MEDIA_BUCKET} harus bersifat private.`);
  }
}

export async function createMediaUploadToken(path: string, contentType: string) {
  await ensureMediaBucket();
  const { data, error } = await getStorageAdmin()
    .storage.from(MEDIA_BUCKET)
    .createSignedUploadUrl(path);
  if (error) throw error;
  return { bucket: MEDIA_BUCKET, path: data.path, token: data.token, contentType };
}

export async function assertMediaObjectExists(
  path: string,
  expectedPrefix: string,
): Promise<void> {
  if (!path.startsWith(expectedPrefix) || path.includes("..")) {
    throw new Error("Path media tidak valid.");
  }
  const separator = path.lastIndexOf("/");
  if (separator < 1 || separator === path.length - 1) {
    throw new Error("Path media tidak valid.");
  }

  const { data, error } = await getStorageAdmin()
    .storage.from(MEDIA_BUCKET)
    .list(path.slice(0, separator), {
      limit: 100,
      search: path.slice(separator + 1),
    });
  if (error) throw error;
  if (!data.some((object) => object.name === path.slice(separator + 1))) {
    throw new Error("File media belum selesai diunggah.");
  }
}

export async function signMediaReferences<T extends string | null>(
  references: T[],
): Promise<Array<string | null>> {
  const storageReferences = references.map((reference) => {
    if (!reference?.startsWith(`storage://${MEDIA_BUCKET}/`)) return null;
    return reference.slice(`storage://${MEDIA_BUCKET}/`.length);
  });
  const paths = [...new Set(storageReferences.filter((path): path is string => !!path))];
  if (paths.length === 0) {
    return references.map((reference) =>
      reference?.startsWith("/uploads/") ? null : reference,
    );
  }

  const { data, error } = await getStorageAdmin()
    .storage.from(MEDIA_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;
  const urls = new Map(
    data.map((result) => [result.path, result.signedUrl ?? null]),
  );

  return references.map((reference, index) => {
    if (reference?.startsWith(`storage://${MEDIA_BUCKET}/`)) {
      return urls.get(storageReferences[index]!) ?? null;
    }
    return reference?.startsWith("/uploads/") ? null : reference;
  });
}
