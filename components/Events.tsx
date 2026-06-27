import type { WeddingConfig, WeddingEvent } from "@/config/wedding";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
        stroke="var(--accent)"
        strokeWidth="1.3"
      />
      <circle cx="12" cy="10" r="2.3" stroke="var(--accent)" strokeWidth="1.3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="var(--accent)" strokeWidth="1.3" />
      <path
        d="M12 7.5V12l3 2"
        stroke="var(--accent)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EventCard({ event, index }: { event: WeddingEvent; index: number }) {
  return (
    <Reveal delay={index * 90}>
      <article className="card group flex h-full flex-col p-7 transition-transform duration-300 hover:-translate-y-1">
        <span className="script text-3xl text-accent">{event.name}</span>
        <span className="rule-accent mt-1 mb-5 h-px w-12" />

        <div className="space-y-3 font-body text-sm">
          <div className="flex items-center gap-3">
            <ClockIcon />
            <div>
              <p className="text-ink">{event.date}</p>
              <p className="text-muted">{event.time}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5">
              <PinIcon />
            </span>
            <div>
              <p className="text-ink">{event.venue}</p>
              <p className="text-muted">{event.address}</p>
            </div>
          </div>
        </div>

        {event.mapUrl && (
          <a
            href={event.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost mt-6 self-start py-2 text-xs"
          >
            View on map
          </a>
        )}
      </article>
    </Reveal>
  );
}

export default function Events({ wedding }: { wedding: WeddingConfig }) {
  return (
    <section id="events" className="py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Save The Dates"
          title="Wedding Events"
          subtitle="We would be honoured to have you celebrate each of these moments with us."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {wedding.events.map((event, i) => (
            <EventCard key={event.name} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
