"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  saveWeddingContent,
  type EditorState,
} from "@/app/dashboard/edit/actions";
import type {
  GalleryPhoto,
  ThemeName,
  WeddingConfig,
  WeddingEvent,
} from "@/config/wedding";
import { uploadMedia } from "@/lib/media";

const THEMES: { value: ThemeName; label: string; hint: string; swatch: string[] }[] =
  [
    { value: "royal", label: "Royal", hint: "Deep maroon & gold", swatch: ["#1c0a10", "#7a1023", "#d4af37"] },
    { value: "minimal", label: "Minimal", hint: "Ivory & rose gold", swatch: ["#fbf8f3", "#b76e79", "#c9a227"] },
    { value: "floral", label: "Floral", hint: "Blush & warm gold", swatch: ["#fdf4f6", "#c98aa6", "#d9a566"] },
    { value: "emerald", label: "Emerald", hint: "Forest green & antique gold", swatch: ["#0c1f17", "#0f5132", "#c9a227"] },
    { value: "midnight", label: "Midnight", hint: "Sapphire & platinum", swatch: ["#0b1020", "#1e3a8a", "#c3cee2"] },
    { value: "noir", label: "Noir", hint: "Onyx & champagne", swatch: ["#121212", "#2a2a2a", "#d8c08a"] },
    { value: "sage", label: "Sage", hint: "Sage green & cream", swatch: ["#f3f5ee", "#6b7f5e", "#a98b5d"] },
    { value: "terracotta", label: "Terracotta", hint: "Terracotta & warm amber", swatch: ["#fbf3ec", "#c06a4d", "#cf9a4e"] },
  ];

const MAX_EVENTS = 12;
const MAX_GALLERY = 24;

// Stable keys so controlled rows survive add/remove/reorder without value bleed.
let keySeq = 0;
type EventRow = WeddingEvent & { _key: number };
type GalleryRow = GalleryPhoto & { _key: number };

function withEventKey(e: WeddingEvent): EventRow {
  return { ...e, _key: keySeq++ };
}
function withGalleryKey(p: GalleryPhoto): GalleryRow {
  return { ...p, _key: keySeq++ };
}

const EMPTY_EVENT: WeddingEvent = {
  name: "",
  date: "",
  time: "",
  venue: "",
  address: "",
  mapUrl: "",
};

export default function ContentEditor({
  slug: initialSlug,
  config,
}: {
  slug: string;
  config: WeddingConfig;
}) {
  const [state, formAction, pending] = useActionState<EditorState, FormData>(
    saveWeddingContent,
    null
  );

  const [slug, setSlug] = useState(initialSlug);
  const [theme, setTheme] = useState<ThemeName>(config.theme);
  const [heroImage, setHeroImage] = useState(config.heroImage ?? "");
  const [events, setEvents] = useState<EventRow[]>(() =>
    (config.events.length ? config.events : [EMPTY_EVENT]).map(withEventKey)
  );
  const [gallery, setGallery] = useState<GalleryRow[]>(() =>
    config.gallery.map(withGalleryKey)
  );
  const [galleryError, setGalleryError] = useState("");

  // Reflect the slug the server actually saved (it may normalize it).
  useEffect(() => {
    if (state?.success && state.slug) setSlug(state.slug);
  }, [state]);

  function updateEvent(key: number, patch: Partial<WeddingEvent>) {
    setEvents((rows) =>
      rows.map((r) => (r._key === key ? { ...r, ...patch } : r))
    );
  }
  function addEvent() {
    setEvents((rows) =>
      rows.length >= MAX_EVENTS ? rows : [...rows, withEventKey(EMPTY_EVENT)]
    );
  }
  function removeEvent(key: number) {
    setEvents((rows) =>
      rows.length <= 1 ? rows : rows.filter((r) => r._key !== key)
    );
  }

  function addGalleryPhoto(src: string) {
    setGallery((rows) =>
      rows.length >= MAX_GALLERY ? rows : [...rows, withGalleryKey({ src })]
    );
  }
  function updateGalleryCaption(key: number, caption: string) {
    setGallery((rows) =>
      rows.map((r) => (r._key === key ? { ...r, caption } : r))
    );
  }
  function removeGalleryPhoto(key: number) {
    setGallery((rows) => rows.filter((r) => r._key !== key));
  }
  function moveGalleryPhoto(key: number, dir: -1 | 1) {
    setGallery((rows) => {
      const i = rows.findIndex((r) => r._key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= rows.length) return rows;
      const next = [...rows];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    // `data-theme` is driven by local state so picking a theme below repaints
    // the whole editor live, before the change is saved.
    <main data-theme={theme} className="theme-surface min-h-screen py-16">
      <div className="container-x max-w-3xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Edit your invitation</p>
            <h1 className="display text-3xl sm:text-4xl">Your content</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${slug}`} className="btn-ghost" target="_blank">
              Preview
            </Link>
            <Link href="/dashboard" className="btn-ghost">
              ← Dashboard
            </Link>
          </div>
        </div>

        <form action={formAction} className="space-y-8">
          <input type="hidden" name="theme" value={theme} />
          <input type="hidden" name="heroImage" value={heroImage} />
          <input type="hidden" name="eventCount" value={events.length} />
          <input type="hidden" name="galleryCount" value={gallery.length} />
          {gallery.map((p, i) => (
            <div key={p._key}>
              <input type="hidden" name={`gallery-${i}-src`} value={p.src} />
              <input
                type="hidden"
                name={`gallery-${i}-caption`}
                value={p.caption ?? ""}
              />
            </div>
          ))}

          {/* Web address ------------------------------------------------- */}
          <section className="card p-7">
            <h2 className="display mb-1 text-2xl">Your web address</h2>
            <p className="mb-5 font-body text-sm text-muted">
              This is the link you&apos;ll share with guests.
            </p>
            <label className="label" htmlFor="slug">
              Address
            </label>
            <div className="flex items-center gap-2">
              <span className="font-body text-sm text-muted">/</span>
              <input
                id="slug"
                name="slug"
                className="field"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="priya-and-arjun"
                autoCapitalize="none"
                spellCheck={false}
                required
              />
            </div>
            <p className="mt-2 font-body text-xs text-muted">
              Lowercase letters, numbers and hyphens. We&apos;ll tidy up spaces
              and capitals for you.
            </p>
          </section>

          {/* Core details ------------------------------------------------ */}
          <section className="card p-7">
            <h2 className="display mb-5 text-2xl">The couple</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                name="brideName"
                label="First name"
                defaultValue={config.brideName}
                required
              />
              <Field
                name="groomName"
                label="Partner's name"
                defaultValue={config.groomName}
                required
              />
              <Field
                name="heroDate"
                label="Wedding date"
                defaultValue={config.heroDate}
                placeholder="12 December 2026"
                required
              />
              <Field
                name="hashtag"
                label="Hashtag (optional)"
                defaultValue={config.hashtag ?? ""}
                placeholder="#PriyaWedsArjun"
              />
            </div>
            <div className="mt-5">
              <label className="label" htmlFor="tagline">
                Tagline
              </label>
              <textarea
                id="tagline"
                name="tagline"
                rows={2}
                className="field"
                defaultValue={config.tagline}
                placeholder="Together with our families, we invite you to celebrate."
              />
            </div>
            <div className="mt-6">
              <p className="label">Hero background photo (optional)</p>
              <ImageUploader
                kind="hero"
                value={heroImage}
                onChange={setHeroImage}
                onClear={() => setHeroImage("")}
                hint="Shown softly behind your names. Wide, landscape photos work best."
                previewClassName="h-40 w-full rounded-xl object-cover"
              />
            </div>
          </section>

          {/* Theme ------------------------------------------------------- */}
          <section className="card p-7">
            <h2 className="display mb-1 text-2xl">Theme</h2>
            <p className="mb-5 font-body text-sm text-muted">
              The look and feel of your invitation page.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {THEMES.map((t) => {
                const active = theme === t.value;
                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    aria-pressed={active}
                    className="rounded-xl border p-4 text-left transition-colors"
                    style={{
                      borderColor: active ? "var(--accent)" : "var(--line)",
                      boxShadow: active
                        ? "0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent)"
                        : "none",
                    }}
                  >
                    <div className="mb-3 flex gap-1.5">
                      {t.swatch.map((c) => (
                        <span
                          key={c}
                          className="h-5 w-5 rounded-full border"
                          style={{ background: c, borderColor: "var(--line)" }}
                        />
                      ))}
                    </div>
                    <p className="font-body text-sm font-semibold text-ink">
                      {t.label}
                    </p>
                    <p className="font-body text-xs text-muted">{t.hint}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Events ------------------------------------------------------ */}
          <section className="card p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="display text-2xl">Events</h2>
              <button
                type="button"
                onClick={addEvent}
                disabled={events.length >= MAX_EVENTS}
                className="btn-ghost px-4 py-2 text-xs disabled:opacity-50"
              >
                + Add event
              </button>
            </div>

            <div className="space-y-6">
              {events.map((ev, i) => (
                <div
                  key={ev._key}
                  className="rounded-xl border p-5"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="eyebrow">Event {i + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeEvent(ev._key)}
                      disabled={events.length <= 1}
                      className="font-body text-xs text-muted underline disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <EventField
                      i={i}
                      field="name"
                      label="Event name"
                      value={ev.name}
                      placeholder="Mehndi"
                      onChange={(v) => updateEvent(ev._key, { name: v })}
                    />
                    <EventField
                      i={i}
                      field="date"
                      label="Date"
                      value={ev.date}
                      placeholder="Thursday, 10 December 2026"
                      onChange={(v) => updateEvent(ev._key, { date: v })}
                    />
                    <EventField
                      i={i}
                      field="time"
                      label="Time"
                      value={ev.time}
                      placeholder="4:00 PM onwards"
                      onChange={(v) => updateEvent(ev._key, { time: v })}
                    />
                    <EventField
                      i={i}
                      field="venue"
                      label="Venue"
                      value={ev.venue}
                      placeholder="The Courtyard, Lily Gardens"
                      onChange={(v) => updateEvent(ev._key, { venue: v })}
                    />
                    <EventField
                      i={i}
                      field="address"
                      label="Address"
                      value={ev.address}
                      placeholder="12 Rose Avenue, Jaipur"
                      onChange={(v) => updateEvent(ev._key, { address: v })}
                    />
                    <EventField
                      i={i}
                      field="mapUrl"
                      label="Map link (optional)"
                      value={ev.mapUrl ?? ""}
                      placeholder="https://maps.google.com/?q=..."
                      onChange={(v) => updateEvent(ev._key, { mapUrl: v })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Gallery ----------------------------------------------------- */}
          <section className="card p-7">
            <div className="mb-1 flex items-center justify-between gap-4">
              <h2 className="display text-2xl">Photo gallery</h2>
              <span className="font-body text-xs text-muted">
                {gallery.length}/{MAX_GALLERY}
              </span>
            </div>
            <p className="mb-5 font-body text-sm text-muted">
              The photos guests see in your story. Drag isn&apos;t needed — use
              the arrows to reorder.
            </p>

            {gallery.length > 0 && (
              <div className="mb-5 grid gap-4 sm:grid-cols-2">
                {gallery.map((p, i) => (
                  <div
                    key={p._key}
                    className="rounded-xl border p-3"
                    style={{ borderColor: "var(--line)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.src}
                      alt={p.caption ?? `Photo ${i + 1}`}
                      className="mb-3 h-40 w-full rounded-lg object-cover"
                    />
                    <input
                      className="field mb-3"
                      placeholder="Caption (optional)"
                      value={p.caption ?? ""}
                      onChange={(e) =>
                        updateGalleryCaption(p._key, e.target.value)
                      }
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveGalleryPhoto(p._key, -1)}
                          disabled={i === 0}
                          className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40"
                          aria-label="Move earlier"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGalleryPhoto(p._key, 1)}
                          disabled={i === gallery.length - 1}
                          className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40"
                          aria-label="Move later"
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGalleryPhoto(p._key)}
                        className="font-body text-xs text-muted underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <UploadButton
              kind="gallery"
              label={gallery.length ? "Add another photo" : "Add a photo"}
              disabled={gallery.length >= MAX_GALLERY}
              onUploaded={addGalleryPhoto}
              onError={setGalleryError}
            />
            {galleryError && (
              <p className="mt-2 font-body text-xs text-red-400">
                {galleryError}
              </p>
            )}
          </section>

          {/* Save -------------------------------------------------------- */}
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </button>
            {state?.error && (
              <p className="font-body text-sm text-red-400">{state.error}</p>
            )}
            {state?.success && (
              <p className="font-body text-sm text-accent">{state.success}</p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        className="field"
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function EventField({
  i,
  field,
  label,
  value,
  placeholder,
  onChange,
}: {
  i: number;
  field: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={`event-${i}-${field}`}
        className="field"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// A button that uploads one image and hands back its public URL. Reused for
// the gallery's "Add a photo" and inside ImageUploader's replace/upload action.
function UploadButton({
  kind,
  label,
  disabled,
  onUploaded,
  onError,
  onBusyChange,
}: {
  kind: string;
  label: string;
  disabled?: boolean;
  onUploaded: (url: string) => void;
  onError?: (msg: string) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be chosen again later
    if (!file) return;
    setBusy(true);
    onBusyChange?.(true);
    onError?.("");
    const result = await uploadMedia(file, kind);
    setBusy(false);
    onBusyChange?.(false);
    if ("error" in result) onError?.(result.error);
    else onUploaded(result.url);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onPick}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || busy}
        className="btn-ghost px-5 py-2.5 text-xs disabled:opacity-50"
      >
        {busy ? "Uploading…" : label}
      </button>
    </>
  );
}

// Single-image field: shows a preview + Replace/Remove, or an upload button.
function ImageUploader({
  kind,
  value,
  onChange,
  onClear,
  hint,
  previewClassName,
}: {
  kind: string;
  value: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  hint?: string;
  previewClassName: string;
}) {
  const [error, setError] = useState("");

  return (
    <div>
      {value ? (
        <div className="flex flex-wrap items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className={previewClassName} />
          <div className="flex gap-2">
            <UploadButton
              kind={kind}
              label="Replace"
              onUploaded={onChange}
              onError={setError}
            />
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="btn-ghost px-5 py-2.5 text-xs"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <UploadButton
          kind={kind}
          label="Upload image"
          onUploaded={onChange}
          onError={setError}
        />
      )}
      {hint && (
        <p className="mt-2 font-body text-xs text-muted">{hint}</p>
      )}
      {error && (
        <p className="mt-2 font-body text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
