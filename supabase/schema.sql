-- ===========================================================================
-- Wed Assist — database schema (multi-tenant)
-- Run this in your Supabase project's SQL Editor (one-time setup; safe to re-run).
--
-- Also enable the Email auth provider:
--   Authentication → Providers → Email (on). For local dev you may turn OFF
--   "Confirm email" so signup logs you straight in.
-- ===========================================================================

-- Weddings (one tenant per couple) ------------------------------------------
-- `config` holds the WeddingConfig JSON (names, events, gallery, theme).
-- It starts empty ('{}') — the app fills in a default template until the couple
-- customizes it in the editor phase.
create table if not exists public.weddings (
  id         uuid        primary key default gen_random_uuid(),
  owner_id   uuid        not null references auth.users(id) on delete cascade,
  slug       text        not null unique,
  config     jsonb       not null default '{}'::jsonb,
  published  boolean     not null default true,
  created_at timestamptz not null default now()
);
create index if not exists weddings_owner_id_idx on public.weddings(owner_id);

-- RSVPs ---------------------------------------------------------------------
create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  party_size  integer     not null default 1 check (party_size >= 0),
  attending   boolean     not null default true,
  message     text,
  created_at  timestamptz not null default now()
);

-- Scope guest data to a wedding ---------------------------------------------
alter table public.rsvps add column if not exists wedding_id uuid references public.weddings(id) on delete cascade;
create index if not exists rsvps_wedding_id_idx on public.rsvps(wedding_id);

-- Invite links --------------------------------------------------------------
-- The couple creates named, shareable links and hands them to sub-hosts:
--   * kind='group'    → multi-use, forwardable ("Dad's friends"). Anyone who
--                       opens it self-registers; their RSVP is filed here.
--   * kind='personal' → a single VIP the couple pre-loads by name + count.
-- A response (rsvps row) carries the invite_link_id it came through (null =
-- the plain link / "Direct"). The token is the public handle: /<slug>?i=<token>.
create table if not exists public.invite_links (
  id             uuid        primary key default gen_random_uuid(),
  wedding_id     uuid        not null references public.weddings(id) on delete cascade,
  label          text        not null,
  kind           text        not null default 'group' check (kind in ('group','personal')),
  token          text        not null unique default substr(md5(gen_random_uuid()::text), 1, 12),
  expected_count integer     not null default 1 check (expected_count >= 0),
  created_at     timestamptz not null default now()
);
create index if not exists invite_links_wedding_id_idx on public.invite_links(wedding_id);

-- Tag each response with the link it arrived through (null = Direct). Deleting a
-- link keeps its responses, just un-groups them. `phone` is captured via links.
alter table public.rsvps add column if not exists invite_link_id uuid
  references public.invite_links(id) on delete set null;
alter table public.rsvps add column if not exists phone text;
create index if not exists rsvps_invite_link_id_idx on public.rsvps(invite_link_id);

-- A guest's RSVP insert (run as anon) needs to confirm the link it stamps belongs
-- to the same wedding — but anon has no SELECT on invite_links (the list is
-- private). SECURITY DEFINER lets this one boolean check see the row without
-- exposing the table, so it can be used safely inside the rsvps insert policy.
create or replace function public.invite_link_in_wedding(p_link_id uuid, p_wedding_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.invite_links l
    where l.id = p_link_id and l.wedding_id = p_wedding_id
  );
$$;

revoke all on function public.invite_link_in_wedding(uuid, uuid) from public;
grant execute on function public.invite_link_in_wedding(uuid, uuid) to anon, authenticated;

-- ===========================================================================
-- Row Level Security
-- Each couple owns their wedding (owner_id = auth.uid()). Guests are anonymous:
-- they may INSERT an RSVP row, but only for a real, published wedding, and they
-- can never read anyone's data. A logged-in couple reads only their own rows —
-- enforced here, so the app uses the user's session (no service-role key).
-- ===========================================================================
alter table public.weddings     enable row level security;
alter table public.rsvps        enable row level security;
alter table public.invite_links enable row level security;

-- weddings: published weddings are publicly readable (the invitation is public);
-- owners can always read their own (incl. drafts) and manage them.
drop policy if exists "weddings_select_public" on public.weddings;
create policy "weddings_select_public"
  on public.weddings for select
  to anon, authenticated
  using (published or owner_id = auth.uid());

drop policy if exists "weddings_insert_own" on public.weddings;
create policy "weddings_insert_own"
  on public.weddings for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "weddings_update_own" on public.weddings;
create policy "weddings_update_own"
  on public.weddings for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "weddings_delete_own" on public.weddings;
create policy "weddings_delete_own"
  on public.weddings for delete
  to authenticated
  using (owner_id = auth.uid());

-- rsvps: anyone may insert, but only into an existing published wedding, and any
-- stamped invite_link must belong to that same wedding (can't tag another
-- couple's link). A null invite_link_id ("Direct") is always allowed.
drop policy if exists "rsvps_insert_anon"  on public.rsvps; -- legacy name
drop policy if exists "rsvps_insert_guest" on public.rsvps;
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

-- rsvps: only the owning couple may read their guests' responses.
drop policy if exists "rsvps_select_owner" on public.rsvps;
create policy "rsvps_select_owner"
  on public.rsvps for select
  to authenticated
  using (
    exists (select 1 from public.weddings w where w.id = rsvps.wedding_id and w.owner_id = auth.uid())
  );

-- invite_links: only the owning couple may manage their links. Guests never read
-- the table directly — the public page resolves a single link via the
-- get_invite_link() function below (SECURITY DEFINER), so a token reveals only
-- its own link, never the whole list.
drop policy if exists "invite_links_select_owner" on public.invite_links;
create policy "invite_links_select_owner"
  on public.invite_links for select
  to authenticated
  using (
    exists (select 1 from public.weddings w where w.id = invite_links.wedding_id and w.owner_id = auth.uid())
  );

drop policy if exists "invite_links_insert_owner" on public.invite_links;
create policy "invite_links_insert_owner"
  on public.invite_links for insert
  to authenticated
  with check (
    exists (select 1 from public.weddings w where w.id = wedding_id and w.owner_id = auth.uid())
  );

drop policy if exists "invite_links_update_owner" on public.invite_links;
create policy "invite_links_update_owner"
  on public.invite_links for update
  to authenticated
  using (
    exists (select 1 from public.weddings w where w.id = invite_links.wedding_id and w.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.weddings w where w.id = wedding_id and w.owner_id = auth.uid())
  );

drop policy if exists "invite_links_delete_owner" on public.invite_links;
create policy "invite_links_delete_owner"
  on public.invite_links for delete
  to authenticated
  using (
    exists (select 1 from public.weddings w where w.id = invite_links.wedding_id and w.owner_id = auth.uid())
  );

-- get_invite_link: resolve a public ?i=<token> to its single link, scoped to the
-- wedding. Runs as SECURITY DEFINER so anonymous guests can look up the one link
-- they hold without any read access to the invite_links table. Returns the
-- published wedding's matching link only (an unpublished wedding reveals nothing).
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

revoke all on function public.get_invite_link(uuid, text) from public;
grant execute on function public.get_invite_link(uuid, text) to anon, authenticated;

-- ===========================================================================
-- Auto-create a wedding when a couple signs up.
-- Runs as SECURITY DEFINER so it can insert regardless of RLS / email
-- confirmation. The slug is random + unique; the couple renames it later.
-- ===========================================================================
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

-- ===========================================================================
-- Storage: wedding media (gallery photos, hero image)
-- A single PUBLIC bucket — invitations are public, so the images are too.
-- Couples upload only under their own folder (named by their auth uid); anyone
-- may read. This is what the in-app editor's uploads write to.
-- ===========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-media', 'wedding-media', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read (the bucket is public anyway; this also allows listing).
drop policy if exists "wedding_media_read" on storage.objects;
create policy "wedding_media_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'wedding-media');

-- A couple may write/replace/delete only files under their own uid folder,
-- e.g. "<auth.uid()>/hero-123.jpg". (storage.foldername(name))[1] is that
-- first path segment.
drop policy if exists "wedding_media_insert_own" on storage.objects;
create policy "wedding_media_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'wedding-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wedding_media_update_own" on storage.objects;
create policy "wedding_media_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'wedding-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'wedding-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wedding_media_delete_own" on storage.objects;
create policy "wedding_media_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'wedding-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- MIGRATION NOTES
-- 1) Earlier single-tenant builds allowed public reads / open inserts. The
--    policies above replace them; this drop cleans up the old name:
drop policy if exists "rsvps_select_anon" on public.rsvps;
-- 2) The self-reported "shagun" feature was removed. Drop its table (and any
--    dependent policies) if you ran an earlier version of this schema:
drop table if exists public.shagun cascade;
-- 3) Pre-existing rsvps rows have a NULL wedding_id and won't appear under any
--    couple. After you sign up, either delete them, or attach them to your new
--    wedding:
--      update public.rsvps set wedding_id = '<your-wedding-id>' where wedding_id is null;
-- ---------------------------------------------------------------------------
