import type { WeddingConfig } from "@/config/wedding";
import Ornament from "./Ornament";

export default function Hero({ wedding }: { wedding: WeddingConfig }) {
  return (
    <header className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 text-center">
      {/* subtle background photo, blended smoothly into the theme */}
      {wedding.heroImage && (
        <div className="pointer-events-none absolute inset-0 -z-20 animate-fade-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={wedding.heroImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-105 object-cover opacity-[0.33] [filter:saturate(0.9)] animate-float"
          />
          {/* soft vignette + bottom fade so text stays crisp and the image
              melts into the page background on every theme */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 35%, transparent 0%, color-mix(in srgb, var(--bg) 55%, transparent) 55%, var(--bg) 100%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/3"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--bg))",
            }}
          />
        </div>
      )}

      {/* soft floating accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="tint-accent absolute left-[12%] top-[18%] h-40 w-40 rounded-full blur-3xl animate-float" />
        <div className="tint-primary absolute right-[10%] bottom-[16%] h-52 w-52 rounded-full blur-3xl animate-float [animation-delay:1.5s]" />
      </div>

      <div className="animate-fade-in">
        <p className="eyebrow mb-6">The Wedding Of</p>

        <h1 className="display text-5xl leading-tight sm:text-7xl md:text-8xl">
          <span className="block">{wedding.brideName}</span>
          <span className="script my-2 block text-3xl text-accent sm:text-5xl">
            &amp;
          </span>
          <span className="block">{wedding.groomName}</span>
        </h1>

        <div className="my-8">
          <Ornament className="mx-auto" />
        </div>

        <p className="mx-auto max-w-xl font-body text-base leading-relaxed text-muted sm:text-lg">
          {wedding.tagline}
        </p>

        <p className="display mt-6 text-xl tracking-wide text-ink sm:text-2xl">
          {wedding.heroDate}
        </p>

        {wedding.hashtag && (
          <p className="mt-3 font-body text-sm tracking-[0.25em] text-accent">
            {wedding.hashtag}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a href="#rsvp" className="btn-primary">
            RSVP Now
          </a>
          <a href="#events" className="btn-ghost">
            View Events
          </a>
        </div>
      </div>

      <a
        href="#events"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-accent"
        aria-label="Scroll down"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          className="animate-float"
        >
          <path
            d="M12 5v14M6 13l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </header>
  );
}
