import type { Metadata } from "next";
import Link from "next/link";
import DashboardView from "@/components/DashboardView";
import DemoThemeShell from "@/components/DemoThemeShell";
import { demoDashboardData, DEMO_SLUG } from "@/lib/demoData";

export const metadata: Metadata = {
  title: "Host dashboard — live demo — Wed Assist",
  description:
    "Explore the couple's control panel: guest-list tracking, invite-link attribution, RSVP totals and CSV export — read-only, no sign-up needed.",
  robots: { index: false, follow: false },
};

// Fully static — renders a fixture (lib/demoData.ts), no database, no auth.
export default function DemoDashboardPage() {
  return (
    <DemoThemeShell initial={demoDashboardData.config.theme} className="min-h-screen">
      <div
        className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 text-sm backdrop-blur"
        style={{
          borderColor: "var(--line)",
          background: "color-mix(in srgb, var(--bg) 82%, transparent)",
        }}
      >
        <span className="font-body text-muted">
          <span className="text-accent">Read-only demo</span> — this is what the
          couple sees. Try the theme switcher below.
        </span>
        <Link href={`/${DEMO_SLUG}`} className="btn-ghost px-4 py-1.5 text-xs">
          ← Back to the invitation
        </Link>
      </div>

      <DashboardView data={demoDashboardData} demo />
    </DemoThemeShell>
  );
}
