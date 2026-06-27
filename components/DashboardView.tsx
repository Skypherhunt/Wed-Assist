import Link from "next/link";
import type { DashboardData } from "@/lib/dashboard";
import { logout } from "@/app/(auth)/actions";
import ExportButtons from "./ExportButtons";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card p-7 text-center">
      <p className="eyebrow mb-3">{label}</p>
      <p className="display gold-text text-5xl">{value}</p>
      {hint && <p className="mt-2 font-body text-sm text-muted">{hint}</p>}
    </div>
  );
}

export default function DashboardView({ data }: { data: DashboardData }) {
  const { config, slug, rsvps, inviteLinks } = data;
  const attending = rsvps.filter((r) => r.attending);
  const confirmedPeople = attending.reduce((s, r) => s + (r.party_size || 0), 0);
  const declined = rsvps.length - attending.length;
  const groupLinks = inviteLinks.filter((l) => l.kind === "group").length;
  const personalLinks = inviteLinks.length - groupLinks;

  // Attending head-count per invite link, for the "by source" breakdown.
  const headsByLink = new Map<string | null, number>();
  for (const r of attending) {
    const k = r.invite_link_id;
    headsByLink.set(k, (headsByLink.get(k) || 0) + (r.party_size || 0));
  }
  const sources = inviteLinks
    .map((l) => ({ label: l.label, heads: headsByLink.get(l.id) || 0 }))
    .concat(
      headsByLink.has(null)
        ? [{ label: "Direct (no link)", heads: headsByLink.get(null) || 0 }]
        : []
    )
    .filter((s) => s.heads > 0)
    .sort((a, b) => b.heads - a.heads);

  return (
    <main className="min-h-screen py-16">
      <div className="container-x">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Hosts&apos; Dashboard</p>
            <h1 className="display text-3xl sm:text-4xl">
              {config.brideName} &amp; {config.groomName}
            </h1>
            <p className="mt-2 font-body text-sm text-muted">
              Your invitation:{" "}
              <Link href={`/${slug}`} className="text-accent hover:underline">
                /{slug}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/edit" className="btn-primary">
              Edit content
            </Link>
            <Link href="/dashboard/invites" className="btn-ghost">
              Manage invites
            </Link>
            <ExportButtons
              slug={slug}
              rsvps={rsvps}
              inviteLinks={inviteLinks}
            />
            <Link href={`/${slug}`} className="btn-ghost">
              View invitation
            </Link>
            <form action={logout}>
              <button type="submit" className="btn-ghost">
                Log out
              </button>
            </form>
          </div>
        </div>

        <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label="Confirmed Guests"
                value={String(confirmedPeople)}
                hint={`${attending.length} accepted invitation(s)`}
              />
              <StatCard
                label="Invite Links"
                value={String(inviteLinks.length)}
                hint={`${groupLinks} group · ${personalLinks} personal`}
              />
              <StatCard
                label="Total Responses"
                value={String(rsvps.length)}
                hint={`${declined} regret(s)`}
              />
            </div>

            <section className="card mt-6 p-7">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="display text-2xl">Confirmed by invite source</h2>
                <Link
                  href="/dashboard/invites"
                  className="text-accent hover:underline font-body text-sm"
                >
                  Manage invites →
                </Link>
              </div>
              {sources.length === 0 ? (
                <p className="font-body text-sm text-muted">
                  No confirmations yet. Create shareable invite links to hand to
                  your sub-hosts and track who they bring.
                </p>
              ) : (
                <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
                  {sources.map((s) => (
                    <li
                      key={s.label}
                      className="flex items-center justify-between gap-4 py-2.5"
                    >
                      <span className="font-body text-ink">{s.label}</span>
                      <span className="display gold-text text-lg">
                        {s.heads}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="mt-12">
              <section className="card p-7">
                <h2 className="display mb-5 text-2xl">Guest Responses</h2>
                {rsvps.length === 0 ? (
                  <p className="font-body text-sm text-muted">No responses yet.</p>
                ) : (
                  <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
                    {rsvps.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between gap-4 py-3"
                      >
                        <div>
                          <p className="font-body text-ink">{r.name}</p>
                          {r.message && (
                            <p className="font-body text-xs text-muted">
                              “{r.message}”
                            </p>
                          )}
                        </div>
                        <span
                          className="shrink-0 rounded-full px-3 py-1 font-body text-xs"
                          style={{
                            border: "1px solid var(--line)",
                            color: r.attending ? "var(--accent)" : "var(--muted)",
                          }}
                        >
                          {r.attending ? `${r.party_size} attending` : "Regrets"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
      </div>
    </main>
  );
}
