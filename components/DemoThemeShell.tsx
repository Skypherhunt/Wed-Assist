"use client";

import { useState } from "react";
import type { ThemeName } from "@/config/wedding";

// Live theme switcher for the demo surfaces. Because every theme is just a
// `[data-theme=…]` CSS-variable block (see app/globals.css), flipping the
// attribute on this wrapper re-skins everything underneath instantly — the same
// per-tenant theming the couple picks in the editor, made tangible for visitors.
// Used on BOTH the demo invitation and the demo dashboard.

const THEMES: { name: ThemeName; label: string; bg: string; primary: string; accent: string }[] = [
  { name: "royal", label: "Royal", bg: "#1c0a10", primary: "#7a1023", accent: "#d4af37" },
  { name: "minimal", label: "Minimal", bg: "#fbf8f3", primary: "#b76e79", accent: "#c9a227" },
  { name: "floral", label: "Floral", bg: "#fdf4f6", primary: "#c98aa6", accent: "#d9a566" },
  { name: "emerald", label: "Emerald", bg: "#0c1f17", primary: "#0f5132", accent: "#c9a227" },
  { name: "midnight", label: "Midnight", bg: "#0b1020", primary: "#1e3a8a", accent: "#c3cee2" },
  { name: "noir", label: "Noir", bg: "#121212", primary: "#2a2a2a", accent: "#d8c08a" },
  { name: "sage", label: "Sage", bg: "#f3f5ee", primary: "#6b7f5e", accent: "#a98b5d" },
  { name: "terracotta", label: "Terracotta", bg: "#fbf3ec", primary: "#c06a4d", accent: "#cf9a4e" },
];

export default function DemoThemeShell({
  initial,
  className = "",
  children,
}: {
  initial: ThemeName;
  className?: string;
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<ThemeName>(initial);
  const current = THEMES.find((t) => t.name === theme) ?? THEMES[0];

  return (
    <div data-theme={theme} className={`theme-surface ${className}`}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
        <div
          className="pointer-events-auto flex max-w-full items-center gap-3 overflow-x-auto rounded-full border px-4 py-2.5 shadow-lg backdrop-blur"
          style={{
            borderColor: "var(--line)",
            background: "color-mix(in srgb, var(--bg) 82%, transparent)",
          }}
        >
          <span className="eyebrow shrink-0 whitespace-nowrap pr-1 text-[0.65rem]">
            Theme · {current.label}
          </span>
          <div className="flex items-center gap-1.5">
            {THEMES.map((t) => {
              const active = t.name === theme;
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setTheme(t.name)}
                  title={t.label}
                  aria-label={`Preview ${t.label} theme`}
                  aria-pressed={active}
                  className="relative h-7 w-7 shrink-0 rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2"
                  style={{
                    background: `linear-gradient(135deg, ${t.primary} 0 50%, ${t.accent} 50% 100%)`,
                    boxShadow: active
                      ? "0 0 0 2px var(--bg), 0 0 0 4px var(--accent)"
                      : `inset 0 0 0 1px ${t.bg}55`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
