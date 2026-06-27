import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Client-side image uploads for the content editor. Files go straight from the
// browser to a public Supabase Storage bucket (see supabase/schema.sql) — this
// sidesteps Next.js Server Action body-size limits and keeps large images off
// our server. Each couple writes only under their own "<uid>/" folder, enforced
// by Storage RLS. The returned public URL is then saved into `weddings.config`.
// ---------------------------------------------------------------------------

export const MEDIA_BUCKET = "wedding-media";
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // keep in sync with the bucket
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type UploadResult = { url: string } | { error: string };

// Upload one image and return its public URL. `kind` is a short label
// ("hero" | "qr" | "gallery") used only to make the stored filename readable.
export async function uploadMedia(
  file: File,
  kind: string
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Please choose a JPG, PNG, WebP or GIF image." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "That image is too large — keep it under 5 MB." };
  }

  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return { error: "Uploads aren't available — Supabase isn't configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${user.id}/${kind}-${Date.now()}-${rand}.${ext}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
