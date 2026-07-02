"use client";

import { useState } from "react";
import { submitRsvp, submitGuestRsvp } from "@/lib/supabase";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

type Status = "idle" | "loading" | "done" | "error";

// The shared invite link a guest arrived through (resolved server-side from
// ?i=<token>). `null` means the plain link — the original open form.
export type InviteContext = {
  linkId: string;
  label: string;
  kind: "group" | "personal";
  expectedCount: number;
};

// A pre-loaded roster guest, resolved server-side from ?g=<token>. Their name is
// locked, their reply is one-per-guest and editable (`existing` is prefilled when
// they've already responded).
export type GuestContext = {
  token: string;
  name: string;
  expectedPartySize: number;
  existing: {
    attending: boolean;
    partySize: number;
    message: string;
  } | null;
};

export default function RsvpForm({
  weddingId,
  invite,
  guest,
}: {
  weddingId: string;
  invite?: InviteContext | null;
  guest?: GuestContext | null;
}) {
  const personal = invite?.kind === "personal";

  // Initial field values differ by mode. A roster guest prefills from their
  // existing reply (edit) or their expected head-count (first time).
  const initialName = guest ? guest.name : personal ? invite!.label : "";
  const initialParty =
    guest?.existing?.partySize ??
    guest?.expectedPartySize ??
    invite?.expectedCount ??
    1;
  const initialAttending = guest?.existing?.attending ?? true;

  const [name, setName] = useState(initialName);
  const [partySize, setPartySize] = useState(initialParty);
  const [attending, setAttending] = useState(initialAttending);
  const [message, setMessage] = useState(guest?.existing?.message ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // True once a roster guest has a reply on file (initially or after submitting).
  const [alreadyReplied, setAlreadyReplied] = useState(Boolean(guest?.existing));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");

    const { error } = guest
      ? await submitGuestRsvp({
          wedding_id: weddingId,
          token: guest.token,
          attending,
          party_size: attending ? partySize : 0,
          message: message.trim(),
        })
      : await submitRsvp({
          wedding_id: weddingId,
          name: name.trim(),
          party_size: attending ? partySize : 0,
          attending,
          message: message.trim(),
          invite_link_id: invite?.linkId ?? null,
        });

    if (error) {
      setError(error);
      setStatus("error");
    } else {
      if (guest) setAlreadyReplied(true);
      setStatus("done");
    }
  }

  const eyebrow = guest
    ? alreadyReplied && guest.existing
      ? "Your RSVP"
      : "You're invited"
    : invite
    ? `Invited via ${invite.label}`
    : "Join Us";

  const title = guest
    ? alreadyReplied && guest.existing
      ? `Update your RSVP, ${guest.name}`
      : `Welcome, ${guest.name}`
    : personal && invite
    ? `Welcome, ${invite.label}`
    : "Confirm Your Presence";

  return (
    <section id="rsvp" className="py-24">
      <div className="container-x max-w-2xl">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle="Kindly let us know if you'll be joining, and how many guests to expect."
        />

        <Reveal>
          <div className="card p-7 sm:p-10">
            {status === "done" ? (
              <div className="py-8 text-center animate-fade-up">
                <div className="tint-accent-strong mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="var(--accent)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="display text-2xl">
                  {attending ? "Thank you for confirming!" : "We'll miss you!"}
                </h3>
                <p className="mt-2 font-body text-muted">
                  {attending
                    ? `We can't wait to celebrate with you${
                        partySize > 1 ? ` and your ${partySize - 1} guest(s)` : ""
                      }.`
                    : "Thank you for letting us know. You'll be in our hearts."}
                </p>
                <button
                  className="btn-ghost mt-6"
                  onClick={() => {
                    setStatus("idle");
                    if (guest) {
                      // Locked to one guest — reopening edits the same reply, so
                      // keep the current values rather than clearing them.
                      return;
                    }
                    // Personal links re-fill the named guest; group/direct clear
                    // so the next person (e.g. someone Dad forwarded to) can reply.
                    setName(personal ? invite!.label : "");
                    setPartySize(invite?.expectedCount || 1);
                    setAttending(true);
                    setMessage("");
                  }}
                >
                  {guest ? "Edit your response" : "Submit another response"}
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label className="label" htmlFor="name">
                    Your Name
                  </label>
                  <input
                    id="name"
                    className="field"
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    // A roster guest's name is fixed by the couple's list.
                    readOnly={Boolean(guest)}
                    aria-readonly={Boolean(guest)}
                  />
                </div>

                <div>
                  <label className="label">Will you attend?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAttending(true)}
                      className={`rounded-xl border px-4 py-3 font-body text-sm transition-all ${
                        attending
                          ? "border-accent tint-accent text-ink"
                          : "text-muted"
                      }`}
                      style={{
                        borderColor: attending ? "var(--accent)" : "var(--line)",
                      }}
                    >
                      Joyfully accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttending(false)}
                      className={`rounded-xl border px-4 py-3 font-body text-sm transition-all ${
                        !attending
                          ? "border-accent tint-accent text-ink"
                          : "text-muted"
                      }`}
                      style={{
                        borderColor: !attending ? "var(--accent)" : "var(--line)",
                      }}
                    >
                      Regretfully decline
                    </button>
                  </div>
                </div>

                {attending && (
                  <div className="animate-fade-up">
                    <label className="label" htmlFor="party">
                      Number of guests (including you)
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        className="btn-ghost h-11 w-11 rounded-full p-0 text-lg"
                        onClick={() => setPartySize((n) => Math.max(1, n - 1))}
                        aria-label="Decrease"
                      >
                        &minus;
                      </button>
                      <span className="display w-12 text-center text-3xl">
                        {partySize}
                      </span>
                      <button
                        type="button"
                        className="btn-ghost h-11 w-11 rounded-full p-0 text-lg"
                        onClick={() => setPartySize((n) => Math.min(20, n + 1))}
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="label" htmlFor="message">
                    A note for the couple (optional)
                  </label>
                  <textarea
                    id="message"
                    className="field min-h-24 resize-y"
                    placeholder="Share your wishes…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {status === "error" && (
                  <p className="font-body text-sm text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={status === "loading"}
                >
                  {status === "loading"
                    ? "Sending…"
                    : alreadyReplied && guest
                    ? "Update RSVP"
                    : "Send RSVP"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
