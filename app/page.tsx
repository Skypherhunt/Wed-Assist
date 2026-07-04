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
  return <LandingPageLoader />;
}
