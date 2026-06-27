"use client";

import { useState } from "react";
import { submitRsvp } from "@/lib/supabase";
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

export default function RsvpForm({
  weddingId,
  invite,
}: {
  weddingId: string;
  invite?: InviteContext | null;
}) {
  const personal = invite?.kind === "personal";
  const [name, setName] = useState(personal ? invite!.label : "");
  const [partySize, setPartySize] = useState(invite?.expectedCount || 1);
  const [attending, setAttending] = useState(true);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    const { error } = await submitRsvp({
      wedding_id: weddingId,
      name: name.trim(),
      party_size: attending ? partySize : 0,
      attending,
      message: message.trim(),
      phone: phone.trim(),
      invite_link_id: invite?.linkId ?? null,
    });
    if (error) {
      setError(error);
      setStatus("error");
    } else {
      setStatus("done");
    }
  }

  return (
    <section id="rsvp" className="py-24">
      <div className="container-x max-w-2xl">
        <SectionHeading
          eyebrow={invite ? `Invited via ${invite.label}` : "Join Us"}
          title={
            personal && invite ? `Welcome, ${invite.label}` : "Confirm Your Presence"
          }
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
                    // Personal links re-fill the named guest; group/direct clear
                    // so the next person (e.g. someone Dad forwarded to) can reply.
                    setName(personal ? invite!.label : "");
                    setPartySize(invite?.expectedCount || 1);
                    setAttending(true);
                    setMessage("");
                    setPhone("");
                  }}
                >
                  Submit another response
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

                {invite && (
                  <div className="animate-fade-up">
                    <label className="label" htmlFor="phone">
                      Phone number (optional)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      className="field"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
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
                  {status === "loading" ? "Sending…" : "Send RSVP"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
