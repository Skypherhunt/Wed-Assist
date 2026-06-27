// One-off generator for placeholder gallery images.
// Replace /public/gallery/*.svg with real assets later.
import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync("public/gallery", { recursive: true });

const shots = [
  { a: "#7a1023", b: "#d4af37", label: "The Proposal" },
  { a: "#3a1d2e", b: "#c98aa6", label: "First Trip" },
  { a: "#1c0a10", b: "#b8860b", label: "Engagement" },
  { a: "#5a1322", b: "#e7c39a", label: "Forever" },
  { a: "#2a0f17", b: "#d9a566", label: "Just Us" },
  { a: "#43243a", b: "#d4af37", label: "Pre-Wedding" },
];

shots.forEach((s, i) => {
  const h = i % 2 === 0 ? 760 : 600; // varied heights for the masonry look
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="${h}" viewBox="0 0 600 ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${s.a}"/>
      <stop offset="1" stop-color="${s.b}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="${h}" fill="url(#g)"/>
  <g fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1.5">
    <circle cx="300" cy="${h / 2 - 30}" r="70"/>
    <path d="M270 ${h / 2 - 30} l30 30 l30 -55"/>
  </g>
  <text x="300" y="${h - 60}" text-anchor="middle" fill="#fff" fill-opacity="0.9"
    font-family="Georgia, serif" font-size="30" letter-spacing="1">${s.label}</text>
  <text x="300" y="${h - 30}" text-anchor="middle" fill="#fff" fill-opacity="0.5"
    font-family="Arial, sans-serif" font-size="13" letter-spacing="3">REPLACE WITH PHOTO</text>
</svg>`;
  writeFileSync(`public/gallery/${i + 1}.svg`, svg);
});

console.log("Placeholders generated.");
