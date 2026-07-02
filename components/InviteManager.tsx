"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { InviteLink } from "@/lib/supabase";
import {
  createInviteLink,
  deleteInviteLink,
  renameInviteLink,
} from "@/app/dashboard/invites/actions";

// Lean response row the loader passes down (a subset of rsvps).
export type Responder = {
  id: string;
  name: string;
  attending: boolean;
  party_size: number;
  invite_link_id: string | null;
};

type Group = {
  link: InviteLink | null; // null = "Direct (no link)"
  responders: Responder[];
  replies: number;
  heads: number; // attending head-count
};

function tally(responders: Responder[]) {
  const heads = responders
    .filter((r) => r.attending)
    .reduce((s, r) => s + (r.party_size || 0), 0);
  return { replies: responders.length, heads };
}

export default function InviteManager({
  slug,
  links,
  responders,
}: {
  slug: string;
  links: InviteLink[];
  responders: Responder[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Create-link form state.
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<"group" | "personal">("group");
  const [expected, setExpected] = useState(2);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const groups: Group[] = useMemo(() => {
    const byLink = new Map<string | null, Responder[]>();
    for (const r of responders) {
      const k = r.invite_link_id;
      if (!byLink.has(k)) byLink.set(k, []);
      byLink.get(k)!.push(r);
    }
    const linked: Group[] = links.map((link) => {
      const rs = byLink.get(link.id) ?? [];
      return { link, responders: rs, ...tally(rs) };
    });
    const directRs = byLink.get(null) ?? [];
    if (directRs.length) {
      linked.push({ link: null, responders: directRs, ...tally(directRs) });
    }
    return linked;
  }, [links, responders]);

  const totalReplies = responders.length;
  const totalHeads = tally(responders).heads;

  function inviteUrl(token: string) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/${slug}?i=${token}`;
  }

  async function copyLink(token: string) {
    try {
      await navigator.clipboard.writeText(inviteUrl(token));
      setCopied(token);
      setTimeout(() => setCopied((c) => (c === token ? null : c)), 1800);
    } catch {
      setError("Couldn't copy — long-press the link to copy it manually.");
    }
  }

  function whatsappHref(label: string, token: string) {
    const text = `You're invited! Please RSVP here: ${inviteUrl(token)}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  function run(fn: () => Promise<{ error?: string }>) {
    setError("");
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      setError("Give the link a name first.");
      return;
    }
    const payload = { label, kind, expectedCount: expected };
    run(async () => {
      const res = await createInviteLink(payload);
      if (!res.error) setLabel("");
      return res;
    });
  }

  return (
    <main className="min-h-screen py-16">
      <div className="container-x">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Guest Tracking</p>
            <h1 className="display text-3xl sm:text-4xl">Invite links</h1>
            <p className="mt-2 max-w-xl font-body text-sm text-muted">
              Create a link, hand it to a sub-host (e.g. give a “Dad’s friends”
              link to your dad), and they can forward it freely. Everyone who
              RSVPs through it is grouped here.
            </p>
          </div>
          <Link href="/dashboard" className="btn-ghost">
            ← Dashboard
          </Link>
        </div>

        {/* Totals */}
        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          <div className="card p-6 text-center">
            <p className="eyebrow mb-2">Invite links</p>
            <p className="display gold-text text-4xl">{links.length}</p>
          </div>
          <div className="card p-6 text-center">
            <p className="eyebrow mb-2">Total replies</p>
            <p className="display gold-text text-4xl">{totalReplies}</p>
          </div>
          <div className="card p-6 text-center">
            <p className="eyebrow mb-2">Heads coming</p>
            <p className="display gold-text text-4xl">{totalHeads}</p>
          </div>
        </div>

        {/* Create a link */}
        <section className="card mb-10 p-7">
          <h2 className="display mb-5 text-2xl">Create a link</h2>
          <form onSubmit={onCreate} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setKind("group")}
                className="rounded-xl border px-4 py-3 text-left font-body text-sm transition-all"
                style={{
                  borderColor: kind === "group" ? "var(--accent)" : "var(--line)",
                  color: kind === "group" ? "var(--ink)" : "var(--muted)",
                }}
              >
                <span className="block font-medium">Group link</span>
                <span className="text-xs text-muted">
                  Forwardable — many people can RSVP
                </span>
              </button>
              <button
                type="button"
                onClick={() => setKind("personal")}
                className="rounded-xl border px-4 py-3 text-left font-body text-sm transition-all"
                style={{
                  borderColor:
                    kind === "personal" ? "var(--accent)" : "var(--line)",
                  color: kind === "personal" ? "var(--ink)" : "var(--muted)",
                }}
              >
                <span className="block font-medium">Personal link</span>
                <span className="text-xs text-muted">
                  One VIP — pre-fills their name
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[16rem] flex-1">
                <label className="label" htmlFor="label">
                  {kind === "personal" ? "Guest's name" : "Link name"}
                </label>
                <input
                  id="label"
                  className="field"
                  placeholder={
                    kind === "personal" ? "e.g. Priya Sharma" : "e.g. Dad's friends"
                  }
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              {kind === "personal" && (
                <div className="w-40">
                  <label className="label" htmlFor="expected">
                    Expected guests
                  </label>
                  <input
                    id="expected"
                    type="number"
                    min={1}
                    max={20}
                    className="field"
                    value={expected}
                    onChange={(e) =>
                      setExpected(Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                </div>
              )}
              <button
                type="submit"
                className="btn-primary"
                disabled={pending}
              >
                {pending ? "Saving…" : "Create link"}
              </button>
            </div>
          </form>
          {error && (
            <p className="mt-4 font-body text-sm text-red-400">{error}</p>
          )}
        </section>

        {/* Links + their responses */}
        {groups.length === 0 ? (
          <p className="font-body text-sm text-muted">
            No links or responses yet. Create your first link above.
          </p>
        ) : (
          <div className="space-y-5">
            {groups.map((g) => {
              const key = g.link?.id ?? "direct";
              const isOpen = expanded[key];
              return (
                <section key={key} className="card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="display text-xl">
                          {g.link ? g.link.label : "Direct (no link)"}
                        </h3>
                        {g.link && (
                          <span
                            className="rounded-full px-2.5 py-0.5 font-body text-xs"
                            style={{
                              border: "1px solid var(--line)",
                              color: "var(--muted)",
                            }}
                          >
                            {g.link.kind === "personal" ? "Personal" : "Group"}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-body text-sm text-muted">
                        {g.replies} repl{g.replies === 1 ? "y" : "ies"} ·{" "}
                        <span className="text-accent">{g.heads}</span> heads coming
                      </p>
                    </div>

                    {g.link && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="btn-ghost px-3 py-1.5 text-xs"
                          onClick={() => copyLink(g.link!.token)}
                        >
                          {copied === g.link.token ? "Copied ✓" : "Copy link"}
                        </button>
                        <a
                          className="btn-ghost px-3 py-1.5 text-xs"
                          href={whatsappHref(g.link.label, g.link.token)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                        <button
                          type="button"
                          className="btn-ghost px-3 py-1.5 text-xs"
                          onClick={() => {
                            const next = window.prompt(
                              "Rename this link",
                              g.link!.label
                            );
                            if (next && next.trim() && next !== g.link!.label) {
                              run(() => renameInviteLink(g.link!.id, next));
                            }
                          }}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="btn-ghost px-3 py-1.5 text-xs"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete “${g.link!.label}”? Its ${g.replies} response(s) are kept and moved to “Direct”.`
                              )
                            ) {
                              run(() => deleteInviteLink(g.link!.id));
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {g.responders.length > 0 && (
                    <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--line)" }}>
                      <button
                        type="button"
                        className="font-body text-sm text-accent hover:underline"
                        onClick={() =>
                          setExpanded((s) => ({ ...s, [key]: !s[key] }))
                        }
                      >
                        {isOpen ? "Hide" : "Show"} {g.responders.length} responder
                        {g.responders.length === 1 ? "" : "s"}
                      </button>
                      {isOpen && (
                        <ul
                          className="mt-3 divide-y"
                          style={{ borderColor: "var(--line)" }}
                        >
                          {g.responders.map((r) => (
                            <li
                              key={r.id}
                              className="flex items-center justify-between gap-4 py-2.5"
                            >
                              <div className="min-w-0">
                                <p className="truncate font-body text-ink">
                                  {r.name}
                                </p>
                              </div>
                              <span
                                className="shrink-0 rounded-full px-3 py-1 font-body text-xs"
                                style={{
                                  border: "1px solid var(--line)",
                                  color: r.attending
                                    ? "var(--accent)"
                                    : "var(--muted)",
                                }}
                              >
                                {r.attending
                                  ? `${r.party_size} attending`
                                  : "Regrets"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
