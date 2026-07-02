"use client";

import type { InviteLink, Rsvp } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Client-side CSV export. The dashboard already loads the couple's RSVPs and
// invite links (RLS-scoped), so we build the file in the browser and trigger a
// download — no extra route or round-trip needed.
// ---------------------------------------------------------------------------

// RFC-4180-ish escaping: wrap every field in quotes, double any inner quotes.
function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(headers: string[], rows: (unknown[])[]): string {
  const lines = [headers, ...rows].map((r) => r.map(csvCell).join(","));
  // Lead with a BOM so Excel opens UTF-8 (names, ₹) correctly.
  return "﻿" + lines.join("\r\n");
}

function download(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleString("en-IN");
}

export default function ExportButtons({
  slug,
  rsvps,
  inviteLinks,
}: {
  slug: string;
  rsvps: Rsvp[];
  inviteLinks: InviteLink[];
}) {
  const linkLabel = new Map(inviteLinks.map((l) => [l.id, l.label]));

  function exportGuests() {
    const rows = rsvps.map((r) => [
      r.name,
      r.attending ? "Attending" : "Regrets",
      r.attending ? r.party_size : 0,
      r.invite_link_id ? linkLabel.get(r.invite_link_id) ?? "(deleted link)" : "Direct",
      r.message ?? "",
      fmtDate(r.created_at),
    ]);
    const csv = toCsv(
      ["Name", "Status", "Party Size", "Invite Source", "Message", "Submitted"],
      rows
    );
    download(`guests-${slug}.csv`, csv);
  }

  return (
    <button
      type="button"
      className="btn-ghost"
      onClick={exportGuests}
      disabled={rsvps.length === 0}
      title={rsvps.length === 0 ? "No responses to export yet" : undefined}
    >
      Export guests
    </button>
  );
}
