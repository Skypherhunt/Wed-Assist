import type { Metadata } from "next";
import LandingPageLoader from "@/components/LandingPageLoader";

export const metadata: Metadata = {
  title: "Wed Assist — One link for your whole wedding",
  description:
    "Wed Assist gives every couple a beautiful invitation site — events, gallery, RSVPs and a live guest list — shareable with a single link. Explore the live demo.",
  openGraph: {
    title: "Wed Assist — One link for your whole wedding",
    description:
      "A beautiful invitation site with events, gallery, RSVPs and a live guest list, shareable with one link.",
    type: "website",
  },
};

export default function Home() {
  // The landing page renders client-only (next/dynamic ssr:false), so the
  // server HTML is otherwise empty and the maroon royal `body` background
  // (globals.css) flashes before the cream landing hydrates. This
  // server-rendered wrapper paints the landing's cream background from the
  // very first frame, covering the body until LandingPage mounts.
  return (
    <div className="landing-page min-h-screen bg-land-background">
      <LandingPageLoader />
    </div>
  );
}
