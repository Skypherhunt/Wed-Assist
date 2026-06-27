"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  defaultWeddingConfig,
  resolveWeddingConfig,
  type WeddingConfig,
  type WeddingEvent,
  type GalleryPhoto,
  type ThemeName,
} from "@/config/wedding";
import { validateSlug } from "@/lib/slug";

export type EditorState = {
  error?: string;
  success?: string;
  // The (possibly normalized) slug the couple ended up with, so the form can
  // reflect what was actually saved.
  slug?: string;
} | null;

const NOT_CONFIGURED =
  "Supabase isn't configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";

const THEMES: ThemeName[] = [
  "royal",
  "minimal",
  "floral",
  "emerald",
  "midnight",
  "noir",
  "sage",
  "terracotta",
];
const MAX_EVENTS = 12;
const MAX_GALLERY = 24;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function saveWeddingContent(
  _prev: EditorState,
  formData: FormData
): Promise<EditorState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  // The couple's wedding (the row handle_new_user created on signup).
  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, slug, config")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!wedding) return { error: "We couldn't find your wedding. Try again." };

  const weddingId = wedding.id as string;

  // --- Slug -----------------------------------------------------------------
  const slugCheck = validateSlug(str(formData, "slug"));
  if (!slugCheck.ok) return { error: slugCheck.error };
  const slug = slugCheck.slug;

  // Only check availability if it actually changed.
  if (slug !== wedding.slug) {
    const { data: clash } = await supabase
      .from("weddings")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (clash && clash.id !== weddingId) {
      return { error: "That web address is already taken. Please pick another." };
    }
  }

  // --- Core details ---------------------------------------------------------
  const brideName = str(formData, "brideName");
  const groomName = str(formData, "groomName");
  const heroDate = str(formData, "heroDate");
  if (!brideName || !groomName) {
    return { error: "Both names are required." };
  }
  if (!heroDate) {
    return { error: "Add your wedding date." };
  }

  const themeInput = str(formData, "theme") as ThemeName;
  const theme: ThemeName = THEMES.includes(themeInput)
    ? themeInput
    : defaultWeddingConfig.theme;

  const hashtag = str(formData, "hashtag");
  const tagline = str(formData, "tagline");

  // --- Events ---------------------------------------------------------------
  const eventCount = Math.min(
    MAX_EVENTS,
    Math.max(0, parseInt(str(formData, "eventCount") || "0", 10) || 0)
  );
  const events: WeddingEvent[] = [];
  for (let i = 0; i < eventCount; i++) {
    const name = str(formData, `event-${i}-name`);
    const venue = str(formData, `event-${i}-venue`);
    // Skip rows the couple left effectively blank.
    if (!name && !venue) continue;
    const mapUrl = str(formData, `event-${i}-mapUrl`);
    events.push({
      name: name || "Celebration",
      date: str(formData, `event-${i}-date`),
      time: str(formData, `event-${i}-time`),
      venue,
      address: str(formData, `event-${i}-address`),
      ...(mapUrl ? { mapUrl } : {}),
    });
  }
  if (events.length === 0) {
    return { error: "Add at least one event." };
  }

  // --- Gallery --------------------------------------------------------------
  // Image URLs come from files already uploaded to Storage client-side; here we
  // just persist the URLs (+ captions) into the config.
  const galleryCount = Math.min(
    MAX_GALLERY,
    Math.max(0, parseInt(str(formData, "galleryCount") || "0", 10) || 0)
  );
  const gallery: GalleryPhoto[] = [];
  for (let i = 0; i < galleryCount; i++) {
    const src = str(formData, `gallery-${i}-src`);
    if (!src) continue;
    const caption = str(formData, `gallery-${i}-caption`);
    gallery.push({ src, ...(caption ? { caption } : {}) });
  }

  // --- Images ---------------------------------------------------------------
  // Empty hero is a valid choice (no background photo).
  const heroImage = str(formData, "heroImage");

  // --- Assemble & persist ---------------------------------------------------
  // Start from the couple's existing (resolved) config so fields we don't edit
  // yet — gallery, hero image — are preserved.
  const base = resolveWeddingConfig(wedding.config as Partial<WeddingConfig>);

  const config: WeddingConfig = {
    ...base,
    theme,
    brideName,
    groomName,
    tagline: tagline || defaultWeddingConfig.tagline,
    heroDate,
    // Stored as "" when the couple removes the hero photo — Hero treats an empty
    // string as "no background", whereas an absent key would revert to default.
    heroImage,
    events,
    gallery,
  };
  if (hashtag) config.hashtag = hashtag;
  else delete config.hashtag;

  const { error } = await supabase
    .from("weddings")
    .update({ config, slug })
    .eq("id", weddingId);

  if (error) {
    // 23505 = unique_violation: a draft wedding we couldn't see in the check
    // above (RLS hides other couples' unpublished rows) may own this slug.
    if (error.code === "23505") {
      return { error: "That web address is already taken. Please pick another." };
    }
    return { error: error.message };
  }

  // Refresh the dashboard, the editor, and both old/new public URLs.
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/edit");
  revalidatePath(`/${wedding.slug}`);
  if (slug !== wedding.slug) revalidatePath(`/${slug}`);

  return { success: "Your invitation has been updated.", slug };
}
