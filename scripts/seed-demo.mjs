// ---------------------------------------------------------------------------
// Seed the public showcase wedding with realistic demo data.
//
// Creates (or reuses) a demo couple, gives their wedding the clean slug
// `/aarav-and-diya`, and populates four invite links + ~20 believable RSVPs so
// the dashboard's invite-attribution feature is worth screenshotting.
//
// This is an ADMIN script: creating invite links and setting a custom slug are
// owner-only operations under Row Level Security, so it uses the Supabase
// SERVICE-ROLE key to bypass RLS. That key is NOT used anywhere in the app — it
// lives only here. Add it to .env.local before running:
//
//   SUPABASE_SERVICE_ROLE_KEY=...   (Supabase → Project Settings → API)
//
// Then:  node scripts/seed-demo.mjs
//
// Re-running is safe: it wipes and re-seeds this one demo wedding's links/RSVPs.
// The demo wedding's `config` is left empty ('{}') on purpose so it inherits the
// default template in config/wedding.ts (Aarav & Diya) — one source of truth.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- Load env from .env.local (Node doesn't auto-read it) ------------------
function loadEnv(file = ".env.local") {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env.local — rely on real environment variables */
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n" +
      "(Supabase → Project Settings → API) in .env.local, then re-run."
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_EMAIL = "demo-couple@wed-assist.example";
const DEMO_PASSWORD = "demo-" + Math.random().toString(36).slice(2);
const DEMO_SLUG = "aarav-and-diya";

// --- Demo content -----------------------------------------------------------
const LINKS = [
  { label: "Bride's family", kind: "group", expected_count: 12 },
  { label: "Groom's college friends", kind: "group", expected_count: 14 },
  { label: "Office colleagues", kind: "group", expected_count: 8 },
  { label: "Dad's friends", kind: "group", expected_count: 10 },
];

// rsvps keyed to a link by its array index above (null = Direct, no link).
const RSVPS = [
  // Bride's family
  { link: 0, name: "Rohan Sharma", party_size: 2, attending: true, message: "Can't wait to celebrate with you both!" },
  { link: 0, name: "Ananya Sharma", party_size: 3, attending: true, message: "" },
  { link: 0, name: "Priya Verma", party_size: 1, attending: false, message: "So sorry to miss it — sending all my love." },
  { link: 0, name: "Meera Nair", party_size: 4, attending: true, message: "We're all thrilled for you!" },
  { link: 0, name: "Aditya Sharma", party_size: 2, attending: true, message: "" },
  // Groom's college friends
  { link: 1, name: "Arjun Kapoor", party_size: 2, attending: true, message: "Wouldn't miss it for the world." },
  { link: 1, name: "Kavya Reddy", party_size: 1, attending: true, message: "" },
  { link: 1, name: "Vikram Singh", party_size: 1, attending: false, message: "Out of town that week, but huge congrats!" },
  { link: 1, name: "Siddharth Menon", party_size: 2, attending: true, message: "" },
  { link: 1, name: "Riya Joshi", party_size: 1, attending: true, message: "So happy for you two!" },
  { link: 1, name: "Karthik Rao", party_size: 3, attending: true, message: "" },
  // Office colleagues
  { link: 2, name: "Ishaan Gupta", party_size: 2, attending: true, message: "" },
  { link: 2, name: "Sneha Pillai", party_size: 1, attending: true, message: "Looking forward to it!" },
  { link: 2, name: "Nikhil Bansal", party_size: 1, attending: false, message: "" },
  // Dad's friends
  { link: 3, name: "Pooja Desai", party_size: 4, attending: true, message: "Wishing you both a lifetime of happiness." },
  { link: 3, name: "Tanvi Shah", party_size: 2, attending: true, message: "" },
  { link: 3, name: "Aarti Kulkarni", party_size: 2, attending: true, message: "" },
  { link: 3, name: "Manish Agarwal", party_size: 3, attending: true, message: "Congratulations to the whole family!" },
  // Direct (no invite link)
  { link: null, name: "Neha Malhotra", party_size: 1, attending: true, message: "" },
  { link: null, name: "Rahul Khanna", party_size: 2, attending: true, message: "Thank you for having us!" },
];

// --- Helpers ----------------------------------------------------------------
async function findUserByEmail(email) {
  // Paginate listUsers until we find the demo account (small projects: 1 page).
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

async function getDemoUser() {
  const existing = await findUserByEmail(DEMO_EMAIL);
  if (existing) return existing;
  const { data, error } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user;
}

// --- Run --------------------------------------------------------------------
async function main() {
  console.log("→ Ensuring demo couple exists…");
  const user = await getDemoUser();

  // The handle_new_user trigger creates a wedding on signup; give it a beat in
  // case the user was just created.
  let wedding = null;
  for (let i = 0; i < 5 && !wedding; i++) {
    const { data } = await admin
      .from("weddings")
      .select("id, slug")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    wedding = data;
    if (!wedding) await new Promise((r) => setTimeout(r, 400));
  }
  if (!wedding) throw new Error("Demo user has no wedding row (trigger missing?).");

  console.log(`→ Setting slug to /${DEMO_SLUG} and publishing…`);
  const { error: upErr } = await admin
    .from("weddings")
    .update({ slug: DEMO_SLUG, published: true, config: {} })
    .eq("id", wedding.id);
  if (upErr) throw upErr;

  console.log("→ Clearing any previous demo links + RSVPs…");
  await admin.from("rsvps").delete().eq("wedding_id", wedding.id);
  await admin.from("invite_links").delete().eq("wedding_id", wedding.id);

  console.log("→ Creating invite links…");
  const { data: links, error: linkErr } = await admin
    .from("invite_links")
    .insert(LINKS.map((l) => ({ ...l, wedding_id: wedding.id })))
    .select("id, label");
  if (linkErr) throw linkErr;

  // Insert order matches LINKS order, so index maps cleanly.
  const linkIdByIndex = links.map((l) => l.id);

  console.log("→ Seeding RSVPs…");
  const rows = RSVPS.map((r) => ({
    wedding_id: wedding.id,
    name: r.name,
    party_size: r.party_size,
    attending: r.attending,
    message: r.message || null,
    invite_link_id: r.link === null ? null : linkIdByIndex[r.link],
  }));
  const { error: rsvpErr } = await admin.from("rsvps").insert(rows);
  if (rsvpErr) throw rsvpErr;

  const attending = RSVPS.filter((r) => r.attending);
  const heads = attending.reduce((s, r) => s + r.party_size, 0);
  console.log(
    `\n✓ Seeded /${DEMO_SLUG}: ${LINKS.length} invite links, ${RSVPS.length} RSVPs ` +
      `(${attending.length} attending = ${heads} guests, ${RSVPS.length - attending.length} regrets).`
  );
  console.log(`  Public page:    /${DEMO_SLUG}`);
  console.log(`  Demo login:     ${DEMO_EMAIL}  (password reset via Supabase if you need dashboard access)`);
}

main().catch((e) => {
  console.error("\n✗ Seed failed:", e.message || e);
  process.exit(1);
});
