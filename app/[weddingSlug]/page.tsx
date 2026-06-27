import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";
import { resolveWeddingConfig, type WeddingConfig } from "@/config/wedding";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import Events from "@/components/Events";
import Gallery from "@/components/Gallery";
import RsvpForm, { type InviteContext } from "@/components/RsvpForm";

// Reads per-request from the database (no static generation).
export const dynamic = "force-dynamic";

type Params = { weddingSlug: string };

async function loadWedding(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("weddings")
    .select("id, owner_id, config, published")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id as string,
    ownerId: data.owner_id as string,
    config: resolveWeddingConfig(data.config as Partial<WeddingConfig>),
  };
}

// Resolve a public ?i=<token> to its invite link via the SECURITY DEFINER RPC
// (a bad/blank token simply returns null → the form falls back to "Direct").
async function loadInvite(
  weddingId: string,
  token: string | undefined
): Promise<InviteContext | null> {
  if (!token) return null;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .rpc("get_invite_link", { p_wedding_id: weddingId, p_token: token })
    .maybeSingle<{
      id: string;
      label: string;
      kind: "group" | "personal";
      expected_count: number;
    }>();
  if (!data) return null;
  return {
    linkId: data.id,
    label: data.label,
    kind: data.kind,
    expectedCount: data.expected_count,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { weddingSlug } = await params;
  const wedding = await loadWedding(weddingSlug);
  if (!wedding) return { title: "Wedding not found — Wed Assist" };
  const { brideName, groomName, tagline } = wedding.config;
  return {
    title: `${brideName} & ${groomName} — Wedding Invitation`,
    description: tagline,
  };
}

export default async function WeddingPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ i?: string }>;
}) {
  const { weddingSlug } = await params;
  const wedding = await loadWedding(weddingSlug);
  if (!wedding) notFound();

  const { id, ownerId, config } = wedding;

  const { i: inviteToken } = await searchParams;
  const invite = await loadInvite(id, inviteToken);

  // Show a host-only bar when the logged-in user owns this wedding.
  // Guests (logged out, or a different couple) never see it.
  const user = await getCurrentUser();
  const isOwner = Boolean(user && user.id === ownerId);

  return (
    <div data-theme={config.theme} className="theme-surface min-h-screen">
      {isOwner && (
        <div
          className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b px-4 py-2.5 text-sm backdrop-blur"
          style={{
            borderColor: "var(--line)",
            background: "color-mix(in srgb, var(--bg) 80%, transparent)",
          }}
        >
          <span className="font-body text-muted">
            You&apos;re viewing your live invitation
          </span>
          <Link href="/dashboard" className="btn-ghost px-4 py-1.5 text-xs">
            ← Back to dashboard
          </Link>
        </div>
      )}
      <main>
        <Hero wedding={config} />

        <Reveal className="divider py-2">
          <span className="script text-2xl">{config.hashtag ?? "Celebrate"}</span>
        </Reveal>

        <Events wedding={config} />
        <Gallery photos={config.gallery} />
        <RsvpForm weddingId={id} invite={invite} />

        <footer
          className="border-t py-12 text-center"
          style={{ borderColor: "var(--line)" }}
        >
          <Reveal>
            <p className="script text-4xl text-accent">
              {config.brideName} &amp; {config.groomName}
            </p>
            <p className="mt-3 font-body text-sm text-muted">{config.heroDate}</p>
          </Reveal>
        </footer>
      </main>
    </div>
  );
}
