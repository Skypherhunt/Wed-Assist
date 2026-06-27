import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveWeddingConfig, type WeddingConfig } from "@/config/wedding";
import ContentEditor from "@/components/ContentEditor";

// Reads the session + the couple's private config, so render per-request.
export const dynamic = "force-dynamic";

export default async function EditContentPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-16">
        <div className="card max-w-md p-8 text-center">
          <h1 className="display text-2xl">Backend not connected</h1>
          <p className="mt-3 font-body text-sm text-muted">
            Add your Supabase keys to <code>.env.local</code> to edit your
            invitation.
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
    .select("id, slug, config")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!wedding) redirect("/login");

  const config = resolveWeddingConfig(wedding.config as Partial<WeddingConfig>);

  // ContentEditor owns its themed wrapper so the theme picker can live-preview.
  return <ContentEditor slug={wedding.slug as string} config={config} />;
}
