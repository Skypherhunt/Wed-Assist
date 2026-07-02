import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found — Wed Assist",
  robots: { index: false, follow: false },
};

// Shown for any unmatched route, and whenever a wedding page calls notFound()
// (e.g. a mistyped invitation link). Renders in the root layout, so it inherits
// the default theme palette and the app's own type + button styles.
export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow mb-6">Wed Assist</p>

      <p className="script text-6xl text-accent sm:text-7xl">Oh no</p>

      <h1 className="display mt-4 text-4xl leading-tight sm:text-5xl">
        We couldn&apos;t find that page
      </h1>

      <p className="mx-auto mt-5 max-w-md font-body text-base leading-relaxed text-muted">
        The link may be mistyped, or this invitation isn&apos;t published yet.
        Double-check the address with whoever shared it with you.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary">
          Go to Wed Assist
        </Link>
        <Link href="/aarav-and-diya" className="btn-ghost">
          See the live demo
        </Link>
      </div>
    </main>
  );
}
