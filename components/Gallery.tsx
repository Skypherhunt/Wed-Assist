"use client";

import { useCallback, useEffect, useState } from "react";
import type { GalleryPhoto } from "@/config/wedding";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const show = useCallback(
    (dir: number) =>
      setActive((cur) =>
        cur === null ? cur : (cur + dir + photos.length) % photos.length
      ),
    [photos.length]
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(1);
      if (e.key === "ArrowLeft") show(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, show]);

  return (
    <section id="gallery" className="py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Moments"
          title="Our Story in Photos"
          subtitle="A glimpse of the journey that brought us here."
        />

        <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
          {photos.map((photo, i) => (
            <Reveal key={photo.src} delay={(i % 3) * 80}>
              <button
                onClick={() => setActive(i)}
                className="group relative block w-full overflow-hidden rounded-xl2 border shadow-soft"
                style={{ borderColor: "var(--line)" }}
                aria-label={`Open photo ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.caption ?? `Photo ${i + 1}`}
                  className="w-full transition-transform duration-500 group-hover:scale-105"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {photo.caption && (
                  <span className="script absolute bottom-3 left-4 text-2xl text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {photo.caption}
                  </span>
                )}
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fade-in"
          onClick={close}
        >
          <button
            className="absolute right-5 top-5 text-3xl text-white/80 hover:text-white"
            onClick={close}
            aria-label="Close"
          >
            &times;
          </button>
          <button
            className="absolute left-4 text-4xl text-white/70 hover:text-white sm:left-10"
            onClick={(e) => {
              e.stopPropagation();
              show(-1);
            }}
            aria-label="Previous"
          >
            &#8249;
          </button>

          <figure
            className="max-h-[85vh] max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[active].src}
              alt={photos[active].caption ?? "Photo"}
              className="max-h-[78vh] w-auto rounded-xl2 shadow-2xl"
            />
            {photos[active].caption && (
              <figcaption className="script mt-4 text-center text-2xl text-white">
                {photos[active].caption}
              </figcaption>
            )}
          </figure>

          <button
            className="absolute right-4 text-4xl text-white/70 hover:text-white sm:right-10"
            onClick={(e) => {
              e.stopPropagation();
              show(1);
            }}
            aria-label="Next"
          >
            &#8250;
          </button>
        </div>
      )}
    </section>
  );
}
