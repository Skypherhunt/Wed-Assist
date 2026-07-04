import type { Metadata } from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  // Absolute base for OG/Twitter image URLs. Set NEXT_PUBLIC_SITE_URL to your
  // deployed origin (e.g. https://wed-assist.netlify.app) in the host's env.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "Wed Assist — One link for your whole wedding",
  description:
    "A beautiful wedding invitation site — events, gallery, RSVPs and a live guest list — all behind a single shareable link.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No data-theme here: the default `:root` palette (royal) styles the landing
  // and auth pages, while each wedding page sets its own theme via a wrapper.
  return (
    <html lang="en">
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
