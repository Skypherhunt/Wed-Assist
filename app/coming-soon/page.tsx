import type { Metadata } from "next";
import Link from "next/link";
import Ornament from "@/components/Ornament";
import { DEMO_SLUG, DEMO_DASHBOARD_PATH } from "@/lib/demoData";

export const metadata: Metadata = {
  title: "Coming soon — Wed Assist",
  description:
    "Public sign-ups are opening soon. Explore everything Wed Assist does in the live demo.",
  robots: { index: false, follow: false },
};

// Static gate shown wherever the (not-yet-open) account flow would begin:
// the "Create your own" CTA, the /signup route, and any attempt to reach the
// dashboard without an account.
export default function ComingSoonPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="card w-full max-w-md p-8 text-center sm:p-10">
        <p className="eyebrow mb-4">Wed Assist</p>
        <h1 className="display text-3xl">Sign-ups are opening soon</h1>
        <div className="my-5">
          <Ornament className="mx-auto" />
        </div>
        <p className="mb-8 font-body text-sm leading-relaxed text-muted">
          We&apos;re putting the finishing touches on the couple experience, so
          creating an account isn&apos;t open just yet. In the meantime you can
          explore everything Wed Assist does — no sign-up needed.
        </p>

        <div className="flex flex-col gap-3">
          <Link href={`/${DEMO_SLUG}`} className="btn-primary w-full">
            See the live demo
          </Link>
          <Link href={DEMO_DASHBOARD_PATH} className="btn-ghost w-full">
            Explore the host dashboard
          </Link>
        </div>

        <Link
          href="/"
          className="mt-6 inline-block font-body text-xs uppercase tracking-[0.2em] text-accent hover:underline"
        >
          ← Home
        </Link>
      </div>
    </main>
  );
}
