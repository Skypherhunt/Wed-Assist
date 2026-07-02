// ---------------------------------------------------------------------------
// Default wedding content template.
// Each couple's real content lives in the `weddings.config` JSONB column and is
// edited in-app (editor phase). Until they customize it, the guest page and
// dashboard fall back to this template via `resolveWeddingConfig()`.
// ---------------------------------------------------------------------------

export type ThemeName =
  | "royal"
  | "minimal"
  | "floral"
  | "emerald"
  | "midnight"
  | "noir"
  | "sage"
  | "terracotta";

export interface WeddingEvent {
  name: string;
  date: string; // human readable, e.g. "Saturday, 12 December 2026"
  time: string; // e.g. "7:00 PM onwards"
  venue: string;
  address: string;
  mapUrl?: string;
}

export interface GalleryPhoto {
  src: string;
  caption?: string;
}

export interface WeddingConfig {
  theme: ThemeName;
  brideName: string;
  groomName: string;
  hashtag?: string;
  tagline: string;
  heroDate: string;
  heroImage?: string; // path under /public, shown subtly behind the hero
  events: WeddingEvent[];
  gallery: GalleryPhoto[];
}

export const defaultWeddingConfig: WeddingConfig = {
  theme: "royal",

  brideName: "Aarav",
  groomName: "Diya",
  hashtag: "#AaravWedsDiya",
  tagline: "Together with our families, we invite you to celebrate our union.",
  heroDate: "12 December 2026",
  heroImage: "/hero.jpg",

  events: [
    {
      name: "Mehndi",
      date: "Thursday, 10 December 2026",
      time: "4:00 PM onwards",
      venue: "The Courtyard, Lily Gardens",
      address: "12 Rose Avenue, Jaipur, Rajasthan",
      mapUrl: "https://maps.google.com/?q=Lily+Gardens+Jaipur",
    },
    {
      name: "Sangeet",
      date: "Friday, 11 December 2026",
      time: "7:00 PM onwards",
      venue: "Grand Ballroom, Hotel Rajmahal",
      address: "MI Road, Jaipur, Rajasthan",
      mapUrl: "https://maps.google.com/?q=Hotel+Rajmahal+Jaipur",
    },
    {
      name: "Wedding Ceremony",
      date: "Saturday, 12 December 2026",
      time: "6:30 PM onwards",
      venue: "Amber Lawns, Fort View Resort",
      address: "Amber Road, Jaipur, Rajasthan",
      mapUrl: "https://maps.google.com/?q=Fort+View+Resort+Jaipur",
    },
    {
      name: "Reception",
      date: "Sunday, 13 December 2026",
      time: "8:00 PM onwards",
      venue: "Crystal Hall, Hotel Rajmahal",
      address: "MI Road, Jaipur, Rajasthan",
      mapUrl: "https://maps.google.com/?q=Hotel+Rajmahal+Jaipur",
    },
  ],

  gallery: [
    { src: "/gallery/1.jpg", caption: "The proposal" },
    { src: "/gallery/2.jpg", caption: "Our first trip" },
    { src: "/gallery/3.jpg", caption: "Engagement day" },
    { src: "/gallery/4.jpg", caption: "Forever begins" },
    { src: "/gallery/5.jpg", caption: "Just us" },
    { src: "/gallery/6.jpg", caption: "Pre-wedding" },
  ],
};

// Merge a stored (possibly empty or partial) wedding config from the database
// over the default template, so the guest page always has complete content.
export function resolveWeddingConfig(
  stored: Partial<WeddingConfig> | null | undefined
): WeddingConfig {
  if (!stored || Object.keys(stored).length === 0) return defaultWeddingConfig;
  return {
    ...defaultWeddingConfig,
    ...stored,
  };
}
