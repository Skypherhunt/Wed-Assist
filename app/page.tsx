import Link from "next/link";
import Ornament from "@/components/Ornament";

export default function Landing() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-16 text-center">
      <p className="eyebrow mb-5">Wed Assist</p>

      <h1 className="display text-4xl leading-tight sm:text-6xl">
        Beautiful wedding
        <span className="script my-1 block text-accent">invitations</span>
        that do the work
      </h1>

      <div className="my-7">
        <Ornament className="mx-auto" />
      </div>

      <p className="mx-auto max-w-xl font-body text-base leading-relaxed text-muted sm:text-lg">
        Share your events and gallery and collect RSVPs — on a gorgeous,
        themeable site. Sign up and yours is ready in seconds.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link href="/signup" className="btn-primary">
          Create your wedding
        </Link>
        <Link href="/login" className="btn-ghost">
          Log in
        </Link>
      </div>

      <p className="mt-16 font-body text-xs uppercase tracking-[0.25em] text-muted">
        For couples · RSVPs · Invites · Galleries
      </p>
    </main>
  );
}
