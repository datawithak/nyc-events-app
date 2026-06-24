import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { BROWSE_TYPES, SCENES } from "@/lib/constants";

export default function Home() {
  const router = useRouter();

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
      `}</style>

      {/* Full-screen container */}
      <div style={{ position: "relative", minHeight: "100dvh", minHeight: "100vh", backgroundColor: "#0a0f0a", overflow: "hidden" }}>

        {/* Watermark layer — 20% opacity image, same structure as landing */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100%", height: "100%",
            backgroundImage: "url('/watermark-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            opacity: 0.2,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Content — sits above watermark */}
        <div style={{ position: "relative", zIndex: 1, minHeight: "100dvh", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

          {/* Top ornament */}
          <div style={{ paddingTop: "clamp(2rem, 8vw, 5rem)", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ height: 1, width: 48, background: "rgba(245,240,230,0.2)", display: "block" }} />
            <span className="deco-diamond" />
            <span style={{ height: 1, width: 48, background: "rgba(245,240,230,0.2)", display: "block" }} />
          </div>

          {/* Title block */}
          <div style={{ textAlign: "center", padding: "1.5rem 1rem 0" }}>
            <p style={{
              margin: "0 0 0.5rem",
              fontFamily: "var(--font-josefin), system-ui, sans-serif",
              fontSize: "clamp(0.55rem, 1.8vw, 0.7rem)",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(245,240,230,0.5)",
            }}>
              New York City
            </p>
            <h1
              className="metro-title"
              style={{ fontSize: "clamp(3.5rem, 15vw, 7rem)", margin: 0, lineHeight: 1 }}
            >
              Metropolitan
            </h1>
            <p style={{
              margin: "0.75rem 0 0",
              fontFamily: "var(--font-josefin), system-ui, sans-serif",
              fontSize: "clamp(0.55rem, 1.8vw, 0.7rem)",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(245,240,230,0.5)",
            }}>
              Event Guide · Summer 2026
            </p>
          </div>

          {/* Bottom ornament */}
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ height: 1, width: 48, background: "rgba(245,240,230,0.2)", display: "block" }} />
            <span className="deco-diamond" />
            <span style={{ height: 1, width: 48, background: "rgba(245,240,230,0.2)", display: "block" }} />
          </div>

          {/* Scene cards */}
          <div style={{ flex: 1, maxWidth: 900, margin: "0 auto", width: "100%", padding: "clamp(1.5rem, 4vw, 3rem) 1rem" }}>

            <p style={{
              textAlign: "center",
              margin: "0 0 clamp(1rem, 3vw, 2rem)",
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1rem, 3vw, 1.25rem)",
              fontStyle: "italic",
              color: "rgba(245,240,230,0.7)",
            }}>
              What are you looking for tonight?
            </p>

            {/* Scene grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "clamp(0.5rem, 2vw, 1rem)",
              marginBottom: "clamp(1.5rem, 4vw, 3rem)",
            }}>
              {SCENES.map((scene) => (
                <Link
                  key={scene.id}
                  href={`/results?scene=${scene.id}`}
                  style={{
                    display: "block",
                    border: "1px solid rgba(245,240,230,0.15)",
                    background: "rgba(26,51,38,0.3)",
                    padding: "clamp(1rem, 3vw, 1.5rem)",
                    textAlign: "center",
                    textDecoration: "none",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(181,212,60,0.4)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(245,240,230,0.15)")}
                >
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
                    <span className="deco-diamond" style={{ opacity: 0.8 }} />
                  </div>
                  <p style={{
                    margin: "0 0 0.4rem",
                    fontFamily: "var(--font-josefin), system-ui, sans-serif",
                    fontSize: "clamp(0.65rem, 2vw, 0.8rem)",
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#f5f0e6",
                  }}>
                    {scene.label}
                  </p>
                  <p style={{
                    margin: 0,
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "clamp(0.7rem, 2vw, 0.875rem)",
                    fontStyle: "italic",
                    color: "rgba(245,240,230,0.4)",
                  }}>
                    {scene.subtitle}
                  </p>
                </Link>
              ))}
            </div>

            {/* Browse by type */}
            <div style={{ marginBottom: "clamp(1rem, 3vw, 2rem)" }}>
              <div className="deco-divider" style={{
                marginBottom: "clamp(0.75rem, 2vw, 1.25rem)",
                fontFamily: "var(--font-josefin), system-ui, sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.3em",
                color: "rgba(245,240,230,0.4)",
                textTransform: "uppercase",
              }}>
                Or browse by type
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" }}>
                {BROWSE_TYPES.map((t) => (
                  <Link
                    key={t.id}
                    href={`/results?type=${t.id}`}
                    style={{
                      border: "1px solid rgba(245,240,230,0.15)",
                      padding: "0.4rem 1rem",
                      fontFamily: "var(--font-josefin), system-ui, sans-serif",
                      fontSize: "clamp(0.55rem, 1.8vw, 0.65rem)",
                      fontWeight: 600,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "rgba(245,240,230,0.7)",
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(181,212,60,0.4)";
                      e.currentTarget.style.color = "#f5f0e6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(245,240,230,0.15)";
                      e.currentTarget.style.color = "rgba(245,240,230,0.7)";
                    }}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
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
                  color: "rgba(245,240,230,0.4)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#b5d43c")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,240,230,0.4)")}
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
