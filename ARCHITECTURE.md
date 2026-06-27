# Architecture

A walkthrough of the three patterns this project explores: tenant isolation, per-tenant theming, and invite attribution.

## 1. Tenancy model

### Tables

- `weddings` — one per couple. Owned by an `auth.users` row via `owner_id`. Carries the unique `slug`, a `published` flag, the chosen `theme`, and a `config` JSON blob.
- `rsvps` — carries `wedding_id`. One row per guest response.
- `invite_links` — carries `wedding_id`. One row per sub-host link.

### Trigger: auto-create tenant on signup

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_slug text;
begin
  -- Find a slug that isn't taken (collisions are astronomically unlikely).
  loop
    new_slug := 'wedding-' || substr(md5(random()::text), 1, 6);
    exit when not exists (select 1 from public.weddings where slug = new_slug);
  end loop;

  insert into public.weddings (owner_id, slug)
  values (new.id, new_slug);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

A couple signs up via Supabase Auth, and a `weddings` row is created in the same transaction. No app-layer "create your wedding" step. The trigger runs as `SECURITY DEFINER` so it can insert regardless of RLS or email-confirmation state.

## 2. Row Level Security

The trust boundary is the database. The Next.js app uses the anon key only — no service role key is shipped to the client or used from the server for tenant data. (The one exception is the offline `scripts/seed-demo.mjs` admin script, which never runs as part of the app.)

### Policy: published weddings are public; drafts are owner-only

The invitation page is meant to be shared, so a *published* wedding is world-readable. An unpublished draft is visible only to the couple that owns it.

```sql
create policy "weddings_select_public"
  on public.weddings for select
  to anon, authenticated
  using (published or owner_id = auth.uid());
```

Mutations are always owner-scoped (`owner_id = auth.uid()` on insert/update/delete), so no one can edit a wedding they don't own.

### Policy: anyone can INSERT an RSVP, but only to a published wedding

```sql
create policy "rsvps_insert_guest"
  on public.rsvps for insert
  to anon, authenticated
  with check (
    exists (select 1 from public.weddings w where w.id = wedding_id and w.published)
    and (
      invite_link_id is null
      or public.invite_link_in_wedding(invite_link_id, wedding_id)
    )
  );
```

This is the interesting one. A guest is unauthenticated, but they can still submit an RSVP **only if** the target `wedding_id` is published. They cannot read other RSVPs back. The RSVP form is essentially a write-only public endpoint, gated by the database.

The second clause stops a guest from stamping their RSVP with another couple's invite link. Anonymous guests have no `SELECT` on `invite_links`, so the check is delegated to `invite_link_in_wedding()` — a `SECURITY DEFINER` function that returns a single boolean ("does this link belong to this wedding?") without exposing the table.

### Policy: only the owner can read their RSVPs

```sql
create policy "rsvps_select_owner"
  on public.rsvps for select
  to authenticated
  using (
    exists (select 1 from public.weddings w where w.id = rsvps.wedding_id and w.owner_id = auth.uid())
  );
```

### Threat model

What this prevents:
- **Tenant A reading Tenant B's guest list** — blocked by the `SELECT` policy on `rsvps`.
- **Tenant A modifying Tenant B's wedding config** — blocked by the `UPDATE` policy on `weddings` (`owner_id = auth.uid()`).
- **A guest enumerating RSVPs by guessing wedding IDs** — blocked because guests have no `SELECT` privilege on `rsvps` at all.
- **A guest submitting an RSVP to an unpublished/draft wedding** — blocked by the `published = true` clause in the `INSERT` policy.
- **A guest tagging their RSVP with a link they don't hold / that belongs to another wedding** — blocked by `invite_link_in_wedding()`.

What this does NOT prevent (out of scope):
- Slug guessing for public invitation pages (intentional — invitations are shareable links).
- A logged-in couple deleting their own data (intentional — they own it).

## 3. Per-tenant theming

Themes are CSS-variable palettes defined once in global CSS. The default `:root` is the `royal` theme:

```css
:root,
[data-theme="royal"] {
  --bg: #1c0a10;
  --surface: #2a0f17;
  --ink: #f6ead7;
  --muted: #c9a98f;
  --primary: #7a1023;
  --accent: #d4af37;
  --line: rgba(212, 175, 55, 0.28);

  --font-display: "Playfair Display", serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-script: "Great Vibes", cursive;
}
```

The `weddings.config.theme` field picks one. The wedding page sets a `data-theme` attribute on its root wrapper, and a single CSS selector swap re-skins the entire invitation — palette **and** font pairing:

```css
[data-theme="emerald"] {
  --bg: #0c1f17;
  --surface: #11291e;
  --primary: #0f5132;
  --accent: #c9a227;
  --font-display: "Playfair Display", serif;
  /* …full palette… */
}
```

No JS, no re-render, no rebuild. Adding a ninth theme is one CSS block (plus its name in the `ThemeName` union in `config/wedding.ts`).

## 4. Invite-link attribution

`invite_links` rows have a short `token` (URL-safe, ~12 chars). Guests visit `/<slug>?i=<token>`. The page resolves the token via `get_invite_link()` — another `SECURITY DEFINER` function, so a token reveals only its own link, never the whole list:

```sql
create or replace function public.get_invite_link(p_wedding_id uuid, p_token text)
returns table (id uuid, label text, kind text, expected_count integer)
language sql
stable
security definer
set search_path = public
as $$
  select l.id, l.label, l.kind, l.expected_count
  from public.invite_links l
  join public.weddings w on w.id = l.wedding_id
  where l.wedding_id = p_wedding_id
    and l.token = p_token
    and w.published
  limit 1;
$$;
```

The RSVP submission stores the resolved `invite_link_id` on the `rsvps` row. The dashboard then groups confirmations by `invite_link_id` to show **which sub-host's network is converting**.

Why this is interesting: sharing is intentionally **delegated and viral**. The couple doesn't manage a master guest list — they hand sub-hosts (parents, siblings, college friends) named links and the head counts roll up automatically.

## 5. Direct-to-storage uploads

Photos and theme assets are uploaded **browser → Supabase Storage**, never proxied through the Next.js server. The `wedding-media` bucket has RLS policies of its own that mirror the tenancy rules — public read, but each couple may only write under their own `<auth.uid()>/` folder:

```sql
-- Public read (invitations are public, so the images are too).
create policy "wedding_media_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'wedding-media');

-- A couple may write only files under their own uid folder,
-- e.g. "<auth.uid()>/hero-123.jpg".
create policy "wedding_media_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'wedding-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

The same `(storage.foldername(name))[1] = auth.uid()::text` check guards `UPDATE` and `DELETE`, so one couple can never overwrite or remove another's media.
