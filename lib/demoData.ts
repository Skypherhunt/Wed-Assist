import { defaultWeddingConfig } from "@/config/wedding";
import type { DashboardData } from "./dashboard";
import type { Guest, InviteLink, Rsvp } from "./supabase";

// ---------------------------------------------------------------------------
// Static snapshot powering the PUBLIC, read-only demo dashboard (/demo).
//
// It is a plain fixture — no database read, no service-role key, no RLS bypass.
// A visitor exploring the demo therefore can't mutate anything and doesn't need
// an account, and the page renders even before the app is deployed/seeded.
//
// It is deliberately RICHER than scripts/seed-demo.mjs: it includes a guest
// roster (so the "On Guest List / not replied" tracking is populated) AND
// open-link responses (so the "Confirmed via open links" attribution panel has
// data) — the two headline couple-side features, both visible at a glance.
// ---------------------------------------------------------------------------

export const DEMO_SLUG = "aarav-and-diya";
export const DEMO_DASHBOARD_PATH = "/demo";

const WEDDING_ID = "demo-wedding";

// Stamp responses across the last few days so "recent first" feels alive.
const day = (d: number, h = 10) =>
  new Date(Date.UTC(2026, 6, 5 - d, h, 0, 0)).toISOString();

const inviteLinks: InviteLink[] = [
  { label: "Bride's family", kind: "group" as const, expected_count: 12, token: "brf8x2k1qz09" },
  { label: "Groom's college friends", kind: "group" as const, expected_count: 14, token: "gcf4m7p2wn55" },
  { label: "Office colleagues", kind: "group" as const, expected_count: 8, token: "off1a9d3vb27" },
  { label: "Dad's friends", kind: "group" as const, expected_count: 10, token: "dad6q5r8tc34" },
].map((l, i) => ({
  id: `link-${i}`,
  wedding_id: WEDDING_ID,
  created_at: day(9 - i),
  ...l,
}));

// Roster guests — the master list. Some have replied (their reply is stamped
// with guest_id below), some are still pending.
const guests: Guest[] = [
  { name: "Priya Verma", expected_party_size: 2 },
  { name: "Meera Nair", expected_party_size: 4 },
  { name: "Vikram Singh", expected_party_size: 1 },
  { name: "Kabir Mehta", expected_party_size: 2 },
  { name: "Ananya Iyer", expected_party_size: 3 },
  { name: "Dev Malhotra", expected_party_size: 2 },
  { name: "Sara Khan", expected_party_size: 1 },
  { name: "Leela Nair", expected_party_size: 2 },
].map((g, i) => ({
  id: `guest-${i}`,
  wedding_id: WEDDING_ID,
  token: `gtok${i}00000000`.slice(0, 12),
  created_at: day(12),
  ...g,
}));

type Seed = {
  name: string;
  party_size: number;
  attending: boolean;
  message: string;
  guest_id: string | null;
  invite_link_id: string | null;
  d: number; // days ago, for ordering
};

// Newest first (matches the dashboard's created_at DESC ordering).
const seeds: Seed[] = [
  // roster replies (stamped with a guest_id — tracked on the guest list)
  { name: "Priya Verma", party_size: 2, attending: true, message: "Counting down the days!", guest_id: "guest-0", invite_link_id: null, d: 0 },
  { name: "Leela Nair", party_size: 2, attending: true, message: "So proud of you both.", guest_id: "guest-7", invite_link_id: null, d: 1 },
  { name: "Dev Malhotra", party_size: 2, attending: true, message: "", guest_id: "guest-5", invite_link_id: null, d: 3 },
  { name: "Vikram Singh", party_size: 1, attending: false, message: "Gutted to miss it — congratulations!", guest_id: "guest-2", invite_link_id: null, d: 4 },
  { name: "Meera Nair", party_size: 4, attending: true, message: "We're all thrilled for you!", guest_id: "guest-1", invite_link_id: null, d: 6 },

  // open-link / unlisted replies (guest_id null — counted "by source")
  { name: "Rohan Sharma", party_size: 2, attending: true, message: "Can't wait to celebrate with you both!", guest_id: null, invite_link_id: "link-0", d: 1 },
  { name: "Arjun Kapoor", party_size: 2, attending: true, message: "Wouldn't miss it for the world.", guest_id: null, invite_link_id: "link-1", d: 2 },
  { name: "Kavya Reddy", party_size: 1, attending: true, message: "", guest_id: null, invite_link_id: "link-1", d: 2 },
  { name: "Siddharth Menon", party_size: 2, attending: true, message: "", guest_id: null, invite_link_id: "link-1", d: 4 },
  { name: "Ishaan Gupta", party_size: 2, attending: true, message: "", guest_id: null, invite_link_id: "link-2", d: 5 },
  { name: "Sneha Pillai", party_size: 1, attending: true, message: "Looking forward to it!", guest_id: null, invite_link_id: "link-2", d: 5 },
  { name: "Nikhil Bansal", party_size: 1, attending: false, message: "", guest_id: null, invite_link_id: "link-2", d: 7 },
  { name: "Pooja Desai", party_size: 4, attending: true, message: "Wishing you both a lifetime of happiness.", guest_id: null, invite_link_id: "link-3", d: 3 },
  { name: "Manish Agarwal", party_size: 3, attending: true, message: "Congratulations to the whole family!", guest_id: null, invite_link_id: "link-3", d: 6 },

  // direct (no link, not on the roster)
  { name: "Neha Malhotra", party_size: 1, attending: true, message: "", guest_id: null, invite_link_id: null, d: 5 },
  { name: "Rahul Khanna", party_size: 2, attending: true, message: "Thank you for having us!", guest_id: null, invite_link_id: null, d: 8 },
];

const rsvps: Rsvp[] = seeds
  .map((s, i) => ({
    id: `rsvp-${i}`,
    wedding_id: WEDDING_ID,
    name: s.name,
    party_size: s.party_size,
    attending: s.attending,
    message: s.message || null,
    invite_link_id: s.invite_link_id,
    guest_id: s.guest_id,
    created_at: day(s.d),
  }))
  .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

export const demoDashboardData: DashboardData = {
  weddingId: WEDDING_ID,
  slug: DEMO_SLUG,
  config: defaultWeddingConfig,
  rsvps,
  inviteLinks,
  guests,
};
