# Wed Assist

A multi-tenant Next.js + Supabase SaaS demonstrating **row-level security isolation**, **per-tenant theming via CSS variables**, and **direct-to-storage uploads** — built as a wedding invitation platform.

> **Why this exists:** This is a portfolio project exploring multi-tenant SaaS patterns, not a product. It's a deliberate study of how to safely isolate tenant data with Postgres RLS, how to express per-tenant visual identity without rebuilds, and how to build a real-world invite-attribution model.

**Live demo:** [aarav-and-diya on Wed Assist](https://your-demo-url.vercel.app/aarav-and-diya)
**Architecture deep-dive:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## Stack

- **Next.js (App Router)** + **TypeScript**
- **Supabase** — Postgres, Auth, Storage; tenant isolation via Row Level Security
- **Tailwind CSS** with CSS-variable theming for per-tenant palettes
- **Lenis** for momentum scrolling (honors `prefers-reduced-motion`)
- **Vercel** for hosting

---

## What it demonstrates

### 1. Multi-tenant data isolation with RLS
Every signup creates a `weddings` row owned by an `auth.users` id. Child tables (`rsvps`, `invite_links`) carry a `wedding_id`, and RLS policies enforce that:
- Guests can `INSERT` into a *published* wedding's `rsvps` (public submit).
- Only the owning couple can `SELECT` their own data.
- No service-role key is ever used from the app.

The trust boundary is the database, not the application layer.

### 2. Per-tenant theming without rebuilds
Eight pre-built themes (`royal`, `minimal`, `floral`, `emerald`, `midnight`, `noir`, `sage`, `terracotta`), each a full CSS-variable palette with its own display/script font pairing. Theme switches happen via a single variable swap on the root — no re-render of styles, no JS recomputation.

### 3. Invite-link attribution
Couples create named **group** or **personal** invite links and delegate sharing (give Dad one link, he forwards it). Guests open `/<slug>?i=<token>`. The dashboard tracks confirmations and head counts **per link**, so couples can see which sub-host's network is responding.

### 4. Direct-to-storage uploads
Hero backgrounds and gallery photos go browser → Supabase Storage directly, with the bucket's RLS policies controlling write access. No file proxy through the Next.js server.

### 5. Practical SaaS plumbing
- Auto-create tenant row on signup via Postgres trigger (`handle_new_user`).
- Config-as-JSON pattern with a default-template fallback in `config/wedding.ts` until the editor saves over it.
- Excel-safe CSV export (UTF-8 BOM + quoting).
- Public/private route split via Supabase Auth middleware.

---

## Architecture at a glance

```
auth.users
    │ (1:1, via trigger)
    ▼
weddings ────────────────────────┐
    │  (slug, config JSON,       │  RLS: owner-only SELECT,
    │   theme, published flag)   │       public INSERT to rsvps when published
    │                            │
    ├── rsvps (wedding_id) ──────┤
    └── invite_links (wedding_id)┘
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the RLS policy walkthrough.

---

## Quick start

```bash
npm install

# 1. Create a free project at https://supabase.com
# 2. In the Supabase SQL Editor, run supabase/schema.sql
#    (creates tables, RLS policies, the "wedding-media" Storage bucket + policies, and the handle_new_user trigger)
# 3. Authentication → Providers → enable "Email"
#    (for local dev, turn OFF "Confirm email" so signup logs you straight in)
# 4. Configure env:
cp .env.local.example .env.local      # then paste your URL + anon key

# Optional: seed demo data
node scripts/seed-demo.mjs

npm run dev                            # http://localhost:3000
```

Sign up at `/signup` — a wedding row with a generated slug is created automatically. Visit `/dashboard` to manage it.

> Whenever `supabase/schema.sql` changes, re-run it in the Supabase SQL Editor — migrations are applied manually.

---

## Routes

| Route                 | Purpose                                                       |
|-----------------------|---------------------------------------------------------------|
| `/`                   | Landing for couples (log in / sign up)                        |
| `/signup` `/login`    | Supabase Auth (email + password)                              |
| `/[weddingSlug]`      | Public guest invitation: hero, events, gallery, RSVP          |
| `/dashboard`          | Signed-in couple's totals, responses, CSV export             |
| `/dashboard/edit`     | In-app content editor (details, theme, events, photos)        |
| `/dashboard/invites`  | Create & track shareable invite links                         |

---

## Repo layout

```
app/                Next.js App Router routes
components/         Shared UI (theme-aware, CSS-variable driven)
config/wedding.ts   Default wedding template + resolveWeddingConfig()
lib/supabase/       Browser + server Supabase clients
supabase/schema.sql Tables, RLS policies, triggers, bucket setup
scripts/            seed-demo.mjs, gen-placeholders.mjs
ARCHITECTURE.md     Deep-dive on tenancy, RLS, theming
```

---

## Deploy

Push to a Git repo and import into **Vercel**. Add the two `NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel project settings.

---

## Status

Feature-complete as a portfolio piece. Not accepting feature requests — the goal is depth in the patterns above, not breadth in the product surface.
