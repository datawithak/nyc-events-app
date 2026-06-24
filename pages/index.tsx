import { useRouter } from "next/router";
import Head from "next/head";

export default function Landing() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Metropolitan — NYC Events</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      {/* Reset any _app wrapper padding */}
      <style>{`
        html, body, #__next, #__next > div {
          margin: 0; padding: 0;
          width: 100%; height: 100%;
        }
      `}</style>

      <div
        onClick={() => router.push("/home")}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%",
          height: "100%",
          /* cover on desktop, contain on tall phones so text is never cropped */
          backgroundImage: "url('/landing-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* Subtle gradient at bottom so hint text is legible on any bg */}
        <div
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: "30%",
            background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Tap hint */}
        <div
          style={{
            position: "absolute",
            bottom: "env(safe-area-inset-bottom, 2rem)",
            marginBottom: "1.5rem",
            left: 0, right: 0,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-josefin), system-ui, sans-serif",
              fontSize: "clamp(0.55rem, 1.8vw, 0.7rem)",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            tap anywhere to enter
          </p>
        </div>
      </div>
    </>
  );
}
