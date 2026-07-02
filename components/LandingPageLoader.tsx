"use client";

import dynamic from "next/dynamic";

// The landing page is GSAP/ScrollTrigger-driven and only makes sense
// client-side, so it's loaded with ssr disabled rather than server-rendered.
// `ssr: false` in next/dynamic requires a Client Component, hence this
// wrapper — app/page.tsx stays a Server Component so it can export metadata.
const LandingPage = dynamic(() => import("@/components/LandingPage"), {
  ssr: false,
});

export default function LandingPageLoader() {
  return <LandingPage />;
}
