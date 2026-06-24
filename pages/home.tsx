import Head from "next/head";
import Link from "next/link";
import { BROWSE_TYPES, SCENES } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <Head>
        <title>Metropolitan — NYC Event Guide</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <style>{`
        html, body, #__next, #__next > div {
          margin: 0; padding: 0;
          width: 100%; height: 100%;
        }
        .scene-card {
          display: block;
          border: 1px solid rgba(90,50,20,0.25);
          background: rgba(255,248,235,0.45);
          padding: clamp(1rem, 3vw, 1.5rem);
          text-align: center;
          text-decoration: none;
          transition: all 0.2s;
          backdrop-filter: blur(3px);
        }
        .scene-card:hover {
          border-color: rgba(120,60,20,0.55);
          background: rgba(255,248,235,0.75);
        }
        .type-pill {
          border: 1px solid rgba(90,50,20,0.25);
          padding: 0.4rem 1rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.2s;
          background: rgba(255,248,235,0.35);
        }
        .type-pill:hover {
          border-color: rgba(120,60,20,0.55);
          background: rgba(255,248,235,0.7);
          color: #4a2008 !important;
        }
      `}</style>

      {/* Full-screen container */}
      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>

        {/* Background — light warm base */}
        <div aria-hidden="true" style={{ position: "fixed", inset: 0, background: "#fdf6ee", zIndex: 0 }} />

        {/* Watermark — watermark-bg.jpg at 20% opacity */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage: "url('/watermark-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            opacity: 0.2,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{
          position: "relative",
          zIndex: 2,

          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}>

          {/* Top ornament */}
          <div style={{
            paddingTop: "clamp(2rem, 8vw, 5rem)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <span style={{ height: 1, width: 40, background: "rgba(90,50,20,0.35)", display: "block" }} />
            <span style={{ width: 7, height: 7, background: "#7a3a10", transform: "rotate(45deg)", display: "inline-block" }} />
            <span style={{ height: 1, width: 40, background: "rgba(90,50,20,0.35)", display: "block" }} />
          </div>

          {/* Title block */}
          <div style={{ textAlign: "center", padding: "1.25rem 1rem 0" }}>
            <p style={{
              margin: "0 0 0.5rem",
              fontFamily: "var(--font-josefin), system-ui, sans-serif",
              fontSize: "clamp(0.55rem, 1.8vw, 0.7rem)",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(80,40,10,0.65)",
            }}>
              New York City
            </p>

            <h1 style={{
              margin: 0,
              fontFamily: "var(--font-bebas), system-ui, sans-serif",
              fontSize: "clamp(3.5rem, 16vw, 8rem)",
              lineHeight: 0.95,
              letterSpacing: "0.08em",
              color: "#5c2a08",
              textShadow: "0 1px 0 rgba(255,220,170,0.4)",
            }}>
              Metropolitan
            </h1>

            <p style={{
              margin: "0.75rem 0 0",
              fontFamily: "var(--font-josefin), system-ui, sans-serif",
              fontSize: "clamp(0.55rem, 1.8vw, 0.7rem)",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(80,40,10,0.65)",
            }}>
              Event Guide · Summer 2026
            </p>
          </div>

          {/* Bottom ornament */}
          <div style={{
            marginTop: "1.25rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <span style={{ height: 1, width: 40, background: "rgba(90,50,20,0.35)", display: "block" }} />
            <span style={{ width: 7, height: 7, background: "#7a3a10", transform: "rotate(45deg)", display: "inline-block" }} />
            <span style={{ height: 1, width: 40, background: "rgba(90,50,20,0.35)", display: "block" }} />
          </div>

          {/* Main content area */}
          <div style={{
            flex: 1,
            maxWidth: 860,
            margin: "0 auto",
            width: "100%",
            padding: "clamp(1.5rem, 4vw, 3rem) 1.25rem",
          }}>

            {/* Tagline */}
            <p style={{
              textAlign: "center",
              margin: "0 0 clamp(1rem, 3vw, 1.75rem)",
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1rem, 3vw, 1.3rem)",
              fontStyle: "italic",
              color: "rgba(70,30,5,0.8)",
            }}>
              What are you looking for tonight?
            </p>

            {/* Scene grid — 2×2 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "clamp(0.5rem, 2vw, 0.875rem)",
              marginBottom: "clamp(1.5rem, 4vw, 2.5rem)",
            }}>
              {SCENES.map((scene) => (
                <Link
                  key={scene.id}
                  href={`/results?scene=${scene.id}`}
                  className="scene-card"
                >
                  {/* Diamond icon */}
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.6rem" }}>
                    <span style={{
                      width: 7, height: 7,
                      background: "#7a3a10",
                      transform: "rotate(45deg)",
                      display: "inline-block",
                      opacity: 0.75,
                    }} />
                  </div>
                  {/* Label only — no subtitle */}
                  <p style={{
                    margin: 0,
                    fontFamily: "var(--font-josefin), system-ui, sans-serif",
                    fontSize: "clamp(0.65rem, 2vw, 0.8rem)",
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#4a2008",
                  }}>
                    {scene.label}
                  </p>
                </Link>
              ))}
            </div>

            {/* Or browse by type divider */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "clamp(0.75rem, 2vw, 1.1rem)",
            }}>
              <span style={{ height: 1, flex: 1, background: "rgba(90,50,20,0.2)" }} />
              <span style={{
                fontFamily: "var(--font-josefin), system-ui, sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.3em",
                color: "rgba(70,30,5,0.55)",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}>
                Or browse by type
              </span>
              <span style={{ height: 1, flex: 1, background: "rgba(90,50,20,0.2)" }} />
            </div>

            {/* Type pills */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "clamp(1rem, 3vw, 1.75rem)",
            }}>
              {BROWSE_TYPES.map((t) => (
                <Link
                  key={t.id}
                  href={`/results?type=${t.id}`}
                  className="type-pill"
                  style={{
                    fontFamily: "var(--font-josefin), system-ui, sans-serif",
                    fontSize: "clamp(0.55rem, 1.8vw, 0.65rem)",
                    color: "rgba(70,30,5,0.75)",
                  }}
                >
                  {t.label}
                </Link>
              ))}
            </div>

            {/* Browse all */}
            <div style={{ textAlign: "center" }}>
              <Link
                href="/results"
                style={{
                  fontFamily: "var(--font-josefin), system-ui, sans-serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "rgba(70,30,5,0.45)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#7a3a10")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(70,30,5,0.45)")}
              >
                Browse all events →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
