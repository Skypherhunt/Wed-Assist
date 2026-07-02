import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Anonymous (public) Supabase client used by guests to submit RSVPs and by the
// dashboard to read aggregate totals. Row Level Security on the
// tables (see supabase/schema.sql) is what keeps this safe to expose.
//
// If env vars are missing the client is `null`, and the helpers below return a
// friendly error instead of crashing — so the UI still renders during local
// setup before Supabase is configured.
// ---------------------------------------------------------------------------

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

export interface Rsvp {
  id: string;
  wedding_id: string;
  name: string;
  party_size: number;
  attending: boolean;
  message: string | null;
  // The invite link this response came through (null = the plain "Direct" link).
  invite_link_id: string | null;
  // The roster guest this response belongs to (null = unlisted: open-link/direct).
  guest_id: string | null;
  created_at: string;
}

export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  expected_party_size: number;
  token: string;
  created_at: string;
}

export interface InviteLink {
  id: string;
  wedding_id: string;
  label: string;
  kind: "group" | "personal";
  token: string;
  expected_count: number;
  created_at: string;
}

const NOT_CONFIGURED =
  "Backend not connected yet. Add your Supabase keys to .env.local to enable submissions.";

export async function submitRsvp(input: {
  wedding_id: string;
  name: string;
  party_size: number;
  attending: boolean;
  message?: string;
  // Set when the guest arrived via a shared invite link; null/omitted = Direct.
  invite_link_id?: string | null;
}): Promise<{ error: string | null }> {
  if (!supabase) return { error: NOT_CONFIGURED };
  const { error } = await supabase.from("rsvps").insert({
    wedding_id: input.wedding_id,
    name: input.name,
    party_size: input.party_size,
    attending: input.attending,
    message: input.message || null,
    invite_link_id: input.invite_link_id || null,
  });
  return { error: error ? error.message : null };
}

// A roster guest's RSVP, gated by their private token. Goes through the
// submit_guest_rsvp RPC (SECURITY DEFINER), which upserts a single response per
// guest — so submitting again edits the existing reply instead of duplicating.
export async function submitGuestRsvp(input: {
  wedding_id: string;
  token: string;
  attending: boolean;
  party_size: number;
  message?: string;
}): Promise<{ error: string | null }> {
  if (!supabase) return { error: NOT_CONFIGURED };
  const { error } = await supabase.rpc("submit_guest_rsvp", {
    p_wedding_id: input.wedding_id,
    p_token: input.token,
    p_attending: input.attending,
    p_party_size: input.party_size,
    p_message: input.message || null,
  });
  return { error: error ? error.message : null };
}

// Dashboard reads now happen server-side with the service-role key — see
// lib/supabaseAdmin.ts. The public client above is used only for guest inserts.
