"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Guest-roster management, scoped to the logged-in couple. Runs with the user's
// session so Row Level Security (supabase/schema.sql, guests_*_owner) guarantees
// a couple can only touch their own wedding's roster — no service-role key.
// ---------------------------------------------------------------------------

export type GuestActionResult = { error?: string };

const NOT_CONFIGURED =
  "Supabase isn't configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";

const MAX_NAME = 80;
const MAX_PARTY = 20;
const MAX_BULK = 200;

function clampParty(n: number | undefined): number {
  return Math.min(MAX_PARTY, Math.max(1, Math.round(n || 1)));
}

// Resolve the current user's wedding id, or an error result.
async function ownerWeddingId() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: NOT_CONFIGURED as string };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!wedding) return { error: "We couldn't find your wedding. Try again." };
  return { supabase, weddingId: wedding.id as string };
}

export async function createGuest(input: {
  name: string;
  expectedPartySize?: number;
}): Promise<GuestActionResult> {
  const ctx = await ownerWeddingId();
  if ("error" in ctx) return { error: ctx.error };

  const name = input.name.trim().slice(0, MAX_NAME);
  if (!name) return { error: "Enter the guest's name." };

  const { error } = await ctx.supabase.from("guests").insert({
    wedding_id: ctx.weddingId,
    name,
    expected_party_size: clampParty(input.expectedPartySize),
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
  return {};
}

// Add many guests at once from a pasted list (one name per line). Lets a couple
// seed their roster in seconds instead of one form submit at a time.
export async function createGuestsBulk(
  rawNames: string
): Promise<GuestActionResult & { added?: number }> {
  const ctx = await ownerWeddingId();
  if ("error" in ctx) return { error: ctx.error };

  const names = rawNames
    .split(/\r?\n/)
    .map((n) => n.trim().slice(0, MAX_NAME))
    .filter(Boolean)
    .slice(0, MAX_BULK);

  if (names.length === 0) return { error: "Paste at least one name." };

  const rows = names.map((name) => ({
    wedding_id: ctx.weddingId,
    name,
    expected_party_size: 1,
  }));

  const { error } = await ctx.supabase.from("guests").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
  return { added: names.length };
}

export async function updateGuest(
  id: string,
  input: { name?: string; expectedPartySize?: number }
): Promise<GuestActionResult> {
  const ctx = await ownerWeddingId();
  if ("error" in ctx) return { error: ctx.error };

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) {
    const name = input.name.trim().slice(0, MAX_NAME);
    if (!name) return { error: "The name can't be empty." };
    patch.name = name;
  }
  if (input.expectedPartySize !== undefined)
    patch.expected_party_size = clampParty(input.expectedPartySize);

  if (Object.keys(patch).length === 0) return {};

  // RLS scopes the update to our own wedding's roster.
  const { error } = await ctx.supabase.from("guests").update(patch).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteGuest(id: string): Promise<GuestActionResult> {
  const ctx = await ownerWeddingId();
  if ("error" in ctx) return { error: ctx.error };

  // Any response survives (rsvps.guest_id ON DELETE SET NULL → "Unlisted").
  const { error } = await ctx.supabase.from("guests").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
  return {};
}
