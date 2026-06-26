import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { formatEventDate, formatEventTime, formatPrice } from "@/lib/format";
import type { Event } from "@/lib/types";

// ─── Quick-access chips ───────────────────────────────────────────────────────
// Each chip links directly to /results with preset filters so parents can
// tap once and see the right events without ever touching a dropdown.
const QUICK_CHIPS = [
  { label: "This Weekend", href: "/results?date=weekend" },
  { label: "Free", href: "/results?price=free&date=weekend" },
  { label: "Kids & Family", href: "/results?scene=with-kids" },
  { label: "Outdoor", href: "/results?type=outdoor" },
  { label: "Music", href: "/results?type=music" },
  { label: "Manhattan", href: "/results?borough=Manhattan" },
  { label: "Brooklyn", href: "/results?borough=Brooklyn" },
  { label: "Queens", href: "/results?borough=Queens" },
  { label: "Bronx", href: "/results?borough=Bronx" },
];

// ─── Discovery rows ───────────────────────────────────────────────────────────
// Three independently-fetched rows. First row is family-first (our core user).
const SECTIONS = [
  {
    title: "Kids & Family This Weekend",
    emoji: "🎪",
    params: "scene=with-kids&date=weekend&limit=12",
    seeAllHref: "/results?scene=with-kids&date=weekend",
  },
  {
    title: "Free This Weekend",
    emoji: "🌳",
    params: "price=free&date=weekend&limit=12",
    seeAllHref: "/results?price=free&date=weekend",
  },
  {
    title: "Happening This Week",
    emoji: "📅",
    params: "date=week&limit=12",
    seeAllHref: "/results?date=week",
  },
] as const;

// ─── Home page component ──────────────────────────────────────────────────────

export default function Home() {
  const [sections, setSections] = useState<Event[][]>([[], [], []]);
  const [loading, setLoading] = useState([true, true, true]);

  // Fetch all rows in parallel on mount
  useEffect(() => {
    SECTIONS.forEach(async (section, i) => {
      try {
        const res = await fetch(`/api/events?${section.params}`);
        const data = await res.json();
        setSections((prev) => {
          const next = [...prev] as Event[][];
          next[i] = data.events ?? [];
          return next;
        });
      } catch {
        // leave empty — section shows "check back soon"
      } finally {
        setLoading((prev) => {
          const next = [...prev];
          next[i] = false;
          return next;
        });
      }
    });
  }, []);

  return (
    <>
      <Head>
        <title>Metropolitan — NYC Events</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <style>{`
        html, body, #__next, #__next > div { margin: 0; padding: 0; width: 100%; }

        /* Hide scrollbars on horizontal rows */
        .scroll-row { scrollbar-width: none; -ms-overflow-style: none; }
        .scroll-row::-webkit-scrollbar { display: none; }

        /* Mini card hover */
        .ev-mini { transition: border-color 0.18s, transform 0.15s; cursor: pointer; }
        .ev-mini:hover { border-color: rgba(40,90,50,0.6) !important; transform: translateY(-2px); }

        /* Quick chip hover */
        .chip { transition: background 0.18s, color 0.18s, border-color 0.18s; }
        .chip:hover { background: #3a6642 !important; color: #f4f7f0 !important; border-color: #3a6642 !important; }

        /* Section "see all" link */
        .see-all-link { transition: color 0.18s; }
        .see-all-link:hover { color: #1a3a2a !important; }

        /* Skeleton pulse */
        @keyframes pulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 0.3; } }
        .skeleton { animation: pulse 1.6s ease-in-out infinite; }

        /* Browse all button */
        .browse-btn { transition: background 0.18s; }
        .browse-btn:hover { background: #2a5035 !important; }
      `}</style>

      {/* Fixed sage background */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, background: "#f4f7f0", zIndex: 0 }} />
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0,
        backgroundImage: "url('/home-bg.jpg')",
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.3, zIndex: 1, pointerEvents: "none",
      }} />

      {/* Page content */}
      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", paddingBottom: "4rem" }}>

        {/* ── Sticky header ── */}
        <header style={{
          borderBottom: "1px solid rgba(30,70,40,0.15)",
          background: "rgba(244,247,240,0.93)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          padding: "0.85rem 1.25rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 20,
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontFamily: "var(--font-bebas), system-ui, sans-serif",
              fontSize: "clamp(1.5rem, 5vw, 2rem)",
              lineHeight: 1,
              letterSpacing: "0.1em",
              color: "#1a3a2a",
            }}>
              Metropolitan
            </h1>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-josefin), system-ui, sans-serif",
              fontSize: "0.5rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(30,70,40,0.5)",
            }}>
              NYC · Summer 2026
            </p>
          </div>
          <Link
            href="/results"
            style={{
              fontFamily: "var(--font-josefin), system-ui, sans-serif",
              fontSize: "0.57rem", letterSpacing: "0.18em",
              textTransform: "uppercase", color: "rgba(20,60,30,0.6)",
              textDecoration: "none",
              border: "1px solid rgba(30,70,40,0.25)",
              padding: "0.35rem 0.8rem",
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(30,70,40,0.5)"; (e.currentTarget as HTMLAnchorElement).style.color = "#1a3a2a"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(30,70,40,0.25)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(20,60,30,0.6)"; }}
          >
            All Events →
          </Link>
        </header>

        {/* ── Quick filter chips ── */}
        <div style={{ paddingTop: "1.1rem" }}>
          <div
            className="scroll-row"
            style={{
              display: "flex", overflowX: "auto",
              gap: "0.45rem", padding: "0 1.25rem 0.25rem",
            }}
          >
            {QUICK_CHIPS.map((chip) => (
              <Link
                key={chip.href}
                href={chip.href}
                className="chip"
                style={{
                  flexShrink: 0,
                  border: "1px solid rgba(30,70,40,0.28)",
                  background: "rgba(240,248,242,0.72)",
                  backdropFilter: "blur(4px)",
                  padding: "0.38rem 0.85rem",
                  fontFamily: "var(--font-josefin), system-ui, sans-serif",
                  fontSize: "0.6rem", fontWeight: 600,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#1a3a2a", textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Event rows ── */}
        {SECTIONS.map((section, i) => (
          <section key={section.title} style={{ marginTop: "2rem" }}>

            {/* Section header */}
            <div style={{
              display: "flex", alignItems: "baseline",
              justifyContent: "space-between",
              padding: "0 1.25rem", marginBottom: "0.85rem",
            }}>
              <h2 style={{
                margin: 0,
                fontFamily: "var(--font-josefin), system-ui, sans-serif",
                fontSize: "clamp(0.68rem, 2.2vw, 0.82rem)",
                fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "#1a3a2a",
              }}>
                {section.emoji}&nbsp; {section.title}
              </h2>
              <Link
                href={section.seeAllHref}
                className="see-all-link"
                style={{
                  fontFamily: "var(--font-josefin), system-ui, sans-serif",
                  fontSize: "0.55rem", letterSpacing: "0.18em",
                  textTransform: "uppercase", color: "rgba(20,60,30,0.42)",
                  textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
                  marginLeft: "0.75rem",
                }}
              >
                See all →
              </Link>
            </div>

            {/* Horizontal scroll row */}
            {loading[i] ? (
              // Skeleton loading state
              <div className="scroll-row" style={{ display: "flex", gap: "0.75rem", padding: "0 1.25rem 0.5rem", overflowX: "auto" }}>
                {[...Array(4)].map((_, j) => (
                  <div
                    key={j}
                    className="skeleton"
                    style={{
                      flexShrink: 0, width: 220, height: 250,
                      border: "1px solid rgba(30,70,40,0.12)",
                      background: "rgba(58,102,66,0.07)",
                    }}
                  />
                ))}
              </div>

            ) : sections[i].length === 0 ? (
              // Empty state
              <p style={{
                padding: "0 1.25rem",
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "0.9rem", fontStyle: "italic",
                color: "rgba(20,60,30,0.38)", margin: 0,
              }}>
                More events added daily — check back soon.
              </p>

            ) : (
              // Cards
              <div
                className="scroll-row"
                style={{
                  display: "flex", overflowX: "auto",
                  gap: "0.75rem", padding: "0 1.25rem 0.75rem",
                }}
              >
                {sections[i].map((ev) => (
                  <MiniCard key={ev.id} event={ev} />
                ))}

                {/* "See all" peek tile at end of row */}
                <Link
                  href={section.seeAllHref}
                  style={{
                    flexShrink: 0, width: 110,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(30,70,40,0.18)",
                    background: "rgba(240,248,242,0.45)",
                    backdropFilter: "blur(4px)",
                    textDecoration: "none", gap: "0.4rem",
                    minHeight: 240,
                    transition: "border-color 0.18s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(40,90,50,0.45)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(30,70,40,0.18)")}
                >
                  <span style={{
                    fontFamily: "var(--font-josefin), system-ui, sans-serif",
                    fontSize: "1.1rem", color: "rgba(20,60,30,0.25)",
                  }}>→</span>
                  <p style={{
                    margin: 0,
                    fontFamily: "var(--font-josefin), system-ui, sans-serif",
                    fontSize: "0.52rem", letterSpacing: "0.18em",
                    textTransform: "uppercase", color: "rgba(20,60,30,0.4)",
                    textAlign: "center", padding: "0 0.5rem",
                  }}>
                    See all
                  </p>
                </Link>
              </div>
            )}
          </section>
        ))}

        {/* ── Divider + Browse All CTA ── */}
        <div style={{ textAlign: "center", marginTop: "3.5rem", padding: "0 1.25rem" }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: "0.75rem", marginBottom: "1.5rem",
          }}>
            <span style={{ height: 1, width: 40, background: "rgba(30,70,40,0.18)", display: "block" }} />
            <span style={{ width: 6, height: 6, background: "#3a6642", transform: "rotate(45deg)", display: "inline-block", opacity: 0.35 }} />
            <span style={{ height: 1, width: 40, background: "rgba(30,70,40,0.18)", display: "block" }} />
          </div>

          <Link
            href="/results"
            className="browse-btn"
            style={{
              display: "inline-block",
              background: "#3a6642",
              color: "#f4f7f0",
              padding: "0.75rem 2.25rem",
              fontFamily: "var(--font-josefin), system-ui, sans-serif",
              fontSize: "0.65rem", fontWeight: 600,
              letterSpacing: "0.22em", textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Browse All Events →
          </Link>

          <p style={{
            marginTop: "1rem",
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "0.8rem", fontStyle: "italic",
            color: "rgba(20,60,30,0.35)",
          }}>
            Search, filter by borough, price, and more
          </p>
        </div>

      </div>
    </>
  );
}

// ─── Mini event card (for horizontal scroll rows) ─────────────────────────────

function MiniCard({ event }: { event: Event }) {
  const date     = formatEventDate(event.start_local);
  const time     = formatEventTime(event.start_local);
  const priceStr = formatPrice(event.is_free, event.price_min, event.price_max);
  const isFree   = priceStr === "Free";

  const href = event.url
    ? event.url
    : `https://www.google.com/search?q=${encodeURIComponent(
        [event.title, event.venue_name, "NYC"].filter(Boolean).join(" ")
      )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="ev-mini"
      style={{
        flexShrink: 0, width: 220,
        display: "flex", flexDirection: "column",
        border: "1px solid rgba(30,70,40,0.18)",
        background: "rgba(240,248,242,0.65)",
        backdropFilter: "blur(4px)",
        textDecoration: "none",
        overflow: "hidden",
      }}
    >
      {/* Image or placeholder */}
      {event.image_url ? (
        <div style={{ width: "100%", height: 128, overflow: "hidden", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.image_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            loading="lazy"
          />
        </div>
      ) : (
        <div style={{
          width: "100%", height: 72, flexShrink: 0,
          background: "rgba(58,102,66,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            width: 10, height: 10,
            background: "#3a6642",
            transform: "rotate(45deg)",
            display: "inline-block",
            opacity: 0.18,
          }} />
        </div>
      )}

      {/* Card body */}
      <div style={{
        flex: 1, padding: "0.7rem 0.85rem 0.85rem",
        display: "flex", flexDirection: "column", gap: "0.22rem",
      }}>
        {/* Free badge */}
        {isFree && (
          <span style={{
            alignSelf: "flex-start",
            background: "rgba(42,110,42,0.11)",
            color: "#2a6e2a",
            padding: "0.08rem 0.42rem",
            fontFamily: "var(--font-josefin), system-ui, sans-serif",
            fontSize: "0.46rem", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            marginBottom: "0.1rem",
          }}>
            Free
          </span>
        )}

        {/* Title */}
        <h3 style={{
          margin: 0,
          fontFamily: "var(--font-josefin), system-ui, sans-serif",
          fontSize: "0.7rem", fontWeight: 600,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: "#1a3a2a", lineHeight: 1.38,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {event.title}
        </h3>

        {/* Date + time */}
        <p style={{
          margin: "0.1rem 0 0",
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "0.82rem", color: "rgba(20,60,30,0.72)",
        }}>
          <span style={{ fontWeight: 600 }}>{date}</span>
          {time && <span style={{ fontStyle: "italic" }}> · {time}</span>}
        </p>

        {/* Venue */}
        {event.venue_name && (
          <p style={{
            margin: 0,
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "0.78rem", fontStyle: "italic",
            color: "rgba(20,60,30,0.46)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {event.venue_name}
          </p>
        )}

        {/* Borough */}
        {event.borough && (
          <p style={{
            margin: "0.1rem 0 0",
            fontFamily: "var(--font-josefin), system-ui, sans-serif",
            fontSize: "0.48rem", letterSpacing: "0.2em",
            textTransform: "uppercase", color: "rgba(20,60,30,0.32)",
          }}>
            {event.borough}
          </p>
        )}

        {/* Price (if not free) */}
        {!isFree && (
          <p style={{
            margin: "auto 0 0",
            paddingTop: "0.4rem",
            fontFamily: "var(--font-josefin), system-ui, sans-serif",
            fontSize: "0.6rem", fontWeight: 600,
            letterSpacing: "0.08em",
            color: "rgba(20,60,30,0.55)",
          }}>
            {priceStr}
          </p>
        )}
      </div>
    </a>
  );
}
