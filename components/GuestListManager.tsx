"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Guest } from "@/lib/supabase";
import {
  createGuest,
  createGuestsBulk,
  updateGuest,
  deleteGuest,
} from "@/app/dashboard/guests/actions";

// One roster guest's reply (only guests who've responded appear here).
export type GuestReply = {
  guest_id: string;
  attending: boolean;
  party_size: number;
};

type Row = {
  guest: Guest;
  reply: GuestReply | null;
  status: "pending" | "attending" | "declined";
};

export default function GuestListManager({
  slug,
  guests,
  replies,
}: {
  slug: string;
  guests: Guest[];
  replies: GuestReply[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Add-guest form state.
  const [name, setName] = useState("");
  const [expected, setExpected] = useState(1);
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const [onlyPending, setOnlyPending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const rows: Row[] = useMemo(() => {
    const byGuest = new Map<string, GuestReply>();
    for (const r of replies) byGuest.set(r.guest_id, r);
    return guests.map((guest) => {
      const reply = byGuest.get(guest.id) ?? null;
      const status: Row["status"] = !reply
        ? "pending"
        : reply.attending
        ? "attending"
        : "declined";
      return { guest, reply, status };
    });
  }, [guests, replies]);

  const totals = useMemo(() => {
    let replied = 0;
    let attending = 0;
    let heads = 0;
    for (const r of rows) {
      if (r.status !== "pending") replied++;
      if (r.status === "attending") {
        attending++;
        heads += r.reply?.party_size || 0;
      }
    }
    return {
      invited: rows.length,
      replied,
      pending: rows.length - replied,
      attending,
      heads,
    };
  }, [rows]);

  const visible = onlyPending ? rows.filter((r) => r.status === "pending") : rows;

  function inviteUrl(token: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/${slug}?g=${token}`;
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

  function whatsappHref(guestName: string, token: string) {
    const text = `Hi ${guestName}! You're invited 🎉 Please RSVP here: ${inviteUrl(
      token
    )}`;
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

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter the guest's name first.");
      return;
    }
    run(async () => {
      const res = await createGuest({
        name,
        expectedPartySize: expected,
      });
      if (!res.error) {
        setName("");
        setExpected(1);
      }
      return res;
    });
  }

  function onBulkAdd() {
    if (!bulk.trim()) {
      setError("Paste at least one name.");
      return;
    }
    run(async () => {
      const res = await createGuestsBulk(bulk);
      if (!res.error) {
        setBulk("");
        setShowBulk(false);
      }
      return res;
    });
  }

  return (
    <main className="min-h-screen py-16">
      <div className="container-x">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Guest List</p>
            <h1 className="display text-3xl sm:text-4xl">Your guests</h1>
            <p className="mt-2 max-w-xl font-body text-sm text-muted">
              Add the people you&apos;re inviting, then share each guest their
              own private RSVP link. You&apos;ll always see who has replied and
              who&apos;s still pending.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/invites" className="btn-ghost">
              Open links
            </Link>
            <Link href="/dashboard" className="btn-ghost">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Totals */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-6 text-center">
            <p className="eyebrow mb-2">Invited</p>
            <p className="display gold-text text-4xl">{totals.invited}</p>
          </div>
          <div className="card p-6 text-center">
            <p className="eyebrow mb-2">Replied</p>
            <p className="display gold-text text-4xl">{totals.replied}</p>
          </div>
          <div className="card p-6 text-center">
            <p className="eyebrow mb-2">Not replied yet</p>
            <p className="display text-4xl" style={{ color: "var(--ink)" }}>
              {totals.pending}
            </p>
          </div>
          <div className="card p-6 text-center">
            <p className="eyebrow mb-2">Heads coming</p>
            <p className="display gold-text text-4xl">{totals.heads}</p>
          </div>
        </div>

        {/* Add a guest */}
        <section className="card mb-10 p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="display text-2xl">Add a guest</h2>
            <button
              type="button"
              className="font-body text-sm text-accent hover:underline"
              onClick={() => setShowBulk((s) => !s)}
            >
              {showBulk ? "Add one at a time" : "Paste a list instead"}
            </button>
          </div>

          {showBulk ? (
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="bulk">
                  One name per line
                </label>
                <textarea
                  id="bulk"
                  className="field min-h-32 resize-y"
                  placeholder={"Priya Sharma\nRahul Mehta\nAunt Sunita"}
                  value={bulk}
                  onChange={(e) => setBulk(e.target.value)}
                />
                <p className="mt-1 font-body text-xs text-muted">
                  Each becomes a guest expecting 1 — edit head-counts after.
                </p>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={onBulkAdd}
                disabled={pending}
              >
                {pending ? "Adding…" : "Add all"}
              </button>
            </div>
          ) : (
            <form
              onSubmit={onAdd}
              className="flex flex-wrap items-end gap-4"
            >
              <div className="min-w-[14rem] flex-1">
                <label className="label" htmlFor="name">
                  Guest&apos;s name
                </label>
                <input
                  id="name"
                  className="field"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="w-32">
                <label className="label" htmlFor="expected">
                  Expected
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
              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? "Saving…" : "Add guest"}
              </button>
            </form>
          )}
          {error && (
            <p className="mt-4 font-body text-sm text-red-400">{error}</p>
          )}
        </section>

        {/* Roster */}
        {rows.length === 0 ? (
          <p className="font-body text-sm text-muted">
            No guests yet. Add your first guest above — or paste your whole list.
          </p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="display text-2xl">
                {visible.length} guest{visible.length === 1 ? "" : "s"}
              </h2>
              {totals.pending > 0 && (
                <button
                  type="button"
                  className="font-body text-sm text-accent hover:underline"
                  onClick={() => setOnlyPending((s) => !s)}
                >
                  {onlyPending
                    ? "Show everyone"
                    : `Show only ${totals.pending} not-replied`}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {visible.map(({ guest, reply, status }) => (
                <section
                  key={guest.id}
                  className="card flex flex-wrap items-center justify-between gap-4 p-5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-body text-lg text-ink">{guest.name}</h3>
                      <StatusBadge status={status} reply={reply} />
                    </div>
                    <p className="mt-0.5 font-body text-xs text-muted">
                      expecting {guest.expected_party_size}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="btn-ghost px-3 py-1.5 text-xs"
                      onClick={() => copyLink(guest.token)}
                    >
                      {copied === guest.token ? "Copied ✓" : "Copy link"}
                    </button>
                    <a
                      className="btn-ghost px-3 py-1.5 text-xs"
                      href={whatsappHref(guest.name, guest.token)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                    <button
                      type="button"
                      className="btn-ghost px-3 py-1.5 text-xs"
                      onClick={() => {
                        const next = window.prompt("Rename guest", guest.name);
                        if (next && next.trim() && next !== guest.name) {
                          run(() => updateGuest(guest.id, { name: next }));
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
                            `Remove ${guest.name} from your guest list? Any reply they sent is kept as "Unlisted".`
                          )
                        ) {
                          run(() => deleteGuest(guest.id));
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function StatusBadge({
  status,
  reply,
}: {
  status: Row["status"];
  reply: GuestReply | null;
}) {
  const label =
    status === "pending"
      ? "Not replied"
      : status === "attending"
      ? `${reply?.party_size ?? 1} attending`
      : "Regrets";
  const color =
    status === "attending"
      ? "var(--accent)"
      : status === "declined"
      ? "var(--muted)"
      : "var(--ink)";
  return (
    <span
      className="shrink-0 rounded-full px-2.5 py-0.5 font-body text-xs"
      style={{ border: "1px solid var(--line)", color }}
    >
      {label}
    </span>
  );
}
