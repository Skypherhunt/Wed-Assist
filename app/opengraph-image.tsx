import { ImageResponse } from "next/og";

// Social preview card for link unfurls (LinkedIn, WhatsApp, Slack, X…).
// Rendered on-brand with the editorial landing palette. Self-contained —
// no external fonts or images, so it works offline and behind a strict CSP.
export const runtime = "edge";
export const alt = "Wed Assist — One link for your whole wedding";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAF6F1",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top row — wordmark + heart */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#241C1E",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#B76E79">
              <path d="M12 21s-8-5.1-8-10.7C4 7.4 6.2 5.4 8.8 5.4c1.9 0 3 .9 3.2 1.9.2-1 1.3-1.9 3.2-1.9 2.6 0 4.8 2 4.8 4.9C20 15.9 12 21 12 21z" />
            </svg>
          </div>
          <div
            style={{
              fontSize: "26px",
              letterSpacing: "6px",
              color: "#94515C",
              textTransform: "uppercase",
            }}
          >
            Wed Assist
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: "84px",
              lineHeight: 1.05,
              color: "#241C1E",
              fontWeight: 600,
              maxWidth: "900px",
            }}
          >
            <span>One link for your&nbsp;</span>
            <span style={{ color: "#B76E79", fontStyle: "italic" }}>whole</span>
            <span>&nbsp;wedding.</span>
          </div>
          <div
            style={{
              marginTop: "28px",
              fontSize: "30px",
              color: "#857A76",
              maxWidth: "760px",
              lineHeight: 1.4,
            }}
          >
            A beautiful invitation site — events, gallery, RSVPs and a live guest
            list — behind a single shareable link.
          </div>
        </div>

        {/* Bottom row — theme swatches + demo cue */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {["#7A2E3A", "#B76E79", "#241C1E", "#125D4C", "#8A9A5B"].map((c) => (
              <div
                key={c}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "999px",
                  background: c,
                }}
              />
            ))}
            <div style={{ fontSize: "24px", color: "#857A76", marginLeft: "6px" }}>
              8 premium themes
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "26px",
              color: "#241C1E",
              borderBottom: "3px solid #B76E79",
              paddingBottom: "4px",
            }}
          >
            See the live demo →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
