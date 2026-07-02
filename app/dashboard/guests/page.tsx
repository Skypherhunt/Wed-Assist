import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Guest } from "@/lib/supabase";
import GuestListManager, { type GuestReply } from "@/components/GuestListManager";

// Reads the session + the couple's private roster/responses, so render per-request.
export const dynamic = "force-dynamic";

export default async function GuestsPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-16">
        <div className="card max-w-md p-8 text-center">
          <h1 className="display text-2xl">Backend not connected</h1>
          <p className="mt-3 font-body text-sm text-muted">
            Add your Supabase keys to <code>.env.local</code> to manage your
            guest list.
          </p>
          <Link href="/dashboard" className="btn-ghost mt-6">
            ← Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Middleware already guards /dashboard/*; this is a safety net.
  if (!user) redirect("/login");

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, slug")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!wedding) redirect("/login");

  const [guestsRes, repliesRes] = await Promise.all([
    supabase
      .from("guests")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("rsvps")
      .select("guest_id, attending, party_size")
      .eq("wedding_id", wedding.id)
      .not("guest_id", "is", null),
  ]);

  return (
    <GuestListManager
      slug={wedding.slug as string}
      guests={(guestsRes.data as Guest[]) ?? []}
      replies={(repliesRes.data as GuestReply[]) ?? []}
    />
  );
}
