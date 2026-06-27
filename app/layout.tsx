import type { Metadata } from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Wed Assist — Beautiful Wedding Invitations",
  description:
    "Create a premium wedding invitation site: RSVPs, events, and gallery — all in one place.",
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
