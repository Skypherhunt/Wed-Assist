"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState } from "react";

// Global smooth-scroll provider. Wraps the whole app (set in app/layout.tsx) so
// wheel/touchpad scrolling gets buttery momentum + easing instead of the
// browser's stepped default. Anchor links (e.g. the hero nav) ease too.
//
// Accessibility: when the visitor asks for reduced motion we render children
// untouched and let the browser handle scrolling natively.
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.75, // lower = silkier glide toward the target
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
        anchors: true, // ease in-page #anchor links too
      }}
    >
      {children}
    </ReactLenis>
  );
}
