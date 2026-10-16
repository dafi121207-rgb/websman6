"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type UploadRequest =
  | { purpose: "submission"; assignmentId: string }
  | { purpose: "attendance"; sessionId: string };

export async function uploadPrivateMedia(
  file: File,
  request: UploadRequest,
): Promise<string> {
  const response = await fetch("/api/storage/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...request,
      contentType: file.type,
      size: file.size,
    }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error ?? "Gagal menyiapkan unggahan media.");
  }

  const { error } = await createBrowserSupabaseClient()
    .storage.from(result.bucket)
    .uploadToSignedUrl(result.path, result.token, file, {
      contentType: file.type,
      cacheControl: "3600",
    });
  if (error) throw new Error(`Unggah media gagal: ${error.message}`);
  return result.path as string;
}
