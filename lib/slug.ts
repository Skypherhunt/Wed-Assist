// ---------------------------------------------------------------------------
// Slug rules for a couple's public URL (/{slug}). A slug must be a clean,
// URL-safe handle and must not collide with the app's own top-level routes
// (e.g. /login, /dashboard) — see `app/` for the routes these guard.
// ---------------------------------------------------------------------------

// Top-level paths the app owns. A custom slug can never be one of these, or
// the invitation would shadow / be shadowed by a real page.
export const RESERVED_SLUGS = new Set<string>([
  // real routes today
  "login",
  "signup",
  "dashboard",
  "auth",
  // framework / infra
  "api",
  "_next",
  "static",
  "public",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  // reserved for the near-term roadmap so we don't have to break a couple's
  // URL later when these pages ship
  "admin",
  "account",
  "settings",
  "billing",
  "edit",
  "new",
  "help",
  "support",
  "about",
  "contact",
  "terms",
  "privacy",
  "pricing",
  "blog",
  "app",
  "www",
]);

export const SLUG_MIN = 3;
export const SLUG_MAX = 40;

// Lowercase, collapse runs of non-alphanumerics to single hyphens, trim
// hyphens off the ends. Mirrors what we'd want a couple to be able to type.
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type SlugCheck = { ok: true; slug: string } | { ok: false; error: string };

// Normalize + validate a user-entered slug. Returns the cleaned slug or a
// human-readable reason it was rejected.
export function validateSlug(input: string): SlugCheck {
  const slug = normalizeSlug(input);

  if (!slug) {
    return { ok: false, error: "Enter a web address for your invitation." };
  }
  if (slug.length < SLUG_MIN) {
    return { ok: false, error: `Too short — use at least ${SLUG_MIN} characters.` };
  }
  if (slug.length > SLUG_MAX) {
    return { ok: false, error: `Too long — keep it under ${SLUG_MAX} characters.` };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { ok: false, error: "That address is reserved. Please pick another." };
  }

  return { ok: true, slug };
}
