"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Browser Supabase client for Client Components (auth forms). Shares the auth
// session via cookies with the server client. Returns null if env vars are
// missing so the UI still renders during local setup.
// ---------------------------------------------------------------------------

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export function createSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(url as string, anonKey as string);
}
