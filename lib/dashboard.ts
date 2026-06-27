import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveWeddingConfig, type WeddingConfig } from "@/config/wedding";
import type { InviteLink, Rsvp } from "./supabase";

// ---------------------------------------------------------------------------
// Dashboard data, scoped to the logged-in couple. Reads run with the user's
// session, so Row Level Security (supabase/schema.sql) guarantees they only see
// their own wedding's guests — no service-role key involved.
// ---------------------------------------------------------------------------

export interface DashboardData {
  weddingId: string;
  slug: string;
  config: WeddingConfig;
  rsvps: Rsvp[];
  inviteLinks: InviteLink[];
}

// Returns the dashboard payload for the current user, or:
//  - "unconfigured" if Supabase env vars are missing
//  - "no-wedding"   if the user somehow has no wedding row
export async function fetchDashboardData(): Promise<
  DashboardData | "unconfigured" | "no-wedding"
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return "unconfigured";

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "no-wedding";

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, slug, config")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!wedding) return "no-wedding";

  const [rsvpRes, linksRes] = await Promise.all([
    supabase
      .from("rsvps")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("invite_links")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: true }),
  ]);

  return {
    weddingId: wedding.id as string,
    slug: wedding.slug as string,
    config: resolveWeddingConfig(wedding.config as Partial<WeddingConfig>),
    rsvps: (rsvpRes.data as Rsvp[]) ?? [],
    inviteLinks: (linksRes.data as InviteLink[]) ?? [],
  };
}
