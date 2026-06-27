import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchDashboardData } from "@/lib/dashboard";
import DashboardView from "@/components/DashboardView";

// Reads the session + private data, so it must render per-request.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await fetchDashboardData();

  if (data === "unconfigured") {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-16">
        <div className="card max-w-md p-8 text-center">
          <h1 className="display text-2xl">Backend not connected</h1>
          <p className="mt-3 font-body text-sm text-muted">
            Add your Supabase keys to <code>.env.local</code> and run{" "}
            <code>supabase/schema.sql</code> to enable the dashboard.
          </p>
          <Link href="/" className="btn-ghost mt-6">
            ← Home
          </Link>
        </div>
      </main>
    );
  }

  // Middleware already redirects signed-out visitors; this is a safety net.
  if (data === "no-wedding") redirect("/login");

  // Match the dashboard to the couple's chosen invitation theme.
  return (
    <div data-theme={data.config.theme} className="theme-surface min-h-screen">
      <DashboardView data={data} />
    </div>
  );
}
