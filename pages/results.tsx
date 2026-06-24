import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { REFINE_TYPES } from "@/lib/constants";
import { formatEventDate, formatEventTime, formatPrice } from "@/lib/format";
import type { Event } from "@/lib/types";

// ─── Dropdown options ──────────────────────────────────────────────────────────

const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

// Sub-neighborhoods per borough (expand over time)
const NEIGHBORHOODS: Record<string, string[]> = {
  Manhattan: [
    "Hudson Yards",
    "Hell's Kitchen",
    "Midtown",
    "Murray Hill",
    "NoMad",
    "Rose Hill",
    "Gramercy",
    "Chelsea",
    "West Village",
    "SoHo",
    "Tribeca",
    "East Village",
    "Lower East Side",
    "Upper West Side",
    "Upper East Side",
    "Harlem",
    "East Harlem",
    "Washington Heights",
    "Financial District",
  ],
  Brooklyn: [
    "Williamsburg",
    "DUMBO",
    "Brooklyn Heights",
    "Park Slope",
    "Crown Heights",
    "Bushwick",
    "Bed-Stuy",
    "Cobble Hill",
    "Prospect Heights",
    "Red Hook",
    "Sunset Park",
    "Bay Ridge",
  ],
  Queens: [
    "Astoria",
    "Long Island City",
    "Flushing",
    "Jamaica",
    "Forest Hills",
    "Jackson Heights",
    "Ridgewood",
  ],
};

const SCENE_OPTIONS = [
  { value: "", label: "Your Scene" },
  { value: "friends-night", label: "Friends Night" },
  { value: "with-kids", label: "With Kids" },
  { value: "date-night", label: "Date Night" },
  { value: "solo", label: "Solo" },
];

const PRICE_OPTIONS = [
  { value: "all", label: "Any Price" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

// Shared dropdown style
const DD: React.CSSProperties = {
  border: "1px solid rgba(90,50,20,0.3)",
  background: "rgba(255,248,235,0.75)",
  backdropFilter: "blur(4px)",
  padding: "0.55rem 2rem 0.55rem 0.85rem",
  fontFamily: "var(--font-josefin), system-ui, sans-serif",
  fontSize: "clamp(0.58rem, 1.6vw, 0.7rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#4a2008",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  minWidth: "152px",
  outline: "none",
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Results() {
  const router = useRouter();

  // Filter state — two-step: pick borough first, then optional sub-neighborhood
  const [borough, setBorough]       = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [scene, setScene]           = useState("");
  const [type, setType]             = useState("all");
  const [price, setPrice]           = useState("all");

  // Derived API location param
  function locationParam(b: string, n: string) {
    if (n) return `nbhd:${n}`;
    return b;
  }

  // Results
  const [events, setEvents]         = useState<Event[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ── helpers ────────────────────────────────────────────────────────────────

  function isDefault(f: { borough: string; neighborhood: string; scene: string; type: string; price: string }) {
    return !f.borough && !f.neighborhood && !f.scene && f.type === "all" && f.price === "all";
  }

  async function doFetch(opts: {
    borough: string; neighborhood: string; scene: string; type: string; price: string; pg: number;
  }) {
    if (isDefault(opts)) {
      setEvents([]); setTotal(0); setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const p = new URLSearchParams({ limit: "24", offset: String((opts.pg - 1) * 24) });
      const loc = locationParam(opts.borough, opts.neighborhood);
      if (loc) p.set("borough", loc);
      if (opts.scene) p.set("scene", opts.scene);
      if (opts.type !== "all") p.set("type", opts.type);
      if (opts.price !== "all") p.set("price", opts.price);

      const res  = await fetch(`/api/events?${p}`);
      const data = await res.json();
      setEvents(data.events ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      setPage(opts.pg);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  // Borough change — clears neighborhood since sub-neighborhoods are borough-specific
  function handleBoroughChange(value: string) {
    setBorough(value);
    setNeighborhood("");
    const next = { borough: value, neighborhood: "", scene, type, price };
    doFetch({ ...next, pg: 1 });
  }

  // Neighborhood change — keeps current borough
  function handleNeighborhoodChange(value: string) {
    setNeighborhood(value);
    const next = { borough, neighborhood: value, scene, type, price };
    doFetch({ ...next, pg: 1 });
  }

  // Generic change for scene/type/price
  function handleChange(field: "scene" | "type" | "price", value: string) {
    const next = {
      borough, neighborhood,
      scene: field === "scene" ? value : scene,
      type:  field === "type"  ? value : type,
      price: field === "price" ? value : price,
    };
    setScene(next.scene); setType(next.type); setPrice(next.price);
    doFetch({ ...next, pg: 1 });
  }

  // ── Sync URL params → state & auto-fetch when URL changes ───────────────────
  // Use router.asPath (not router.isReady) as the dependency so this re-fires
  // on every client-side navigation. When router.isReady is already true on
  // mount (happens with <Link> navigation), [router.isReady] would never change
  // again, leaving the previous route's stale query in effect.
  useEffect(() => {
    if (!router.isReady) return;
    const s = (router.query.scene as string) || "";
    const t = (router.query.type  as string) || "all";
    const b = (router.query.borough as string) || "";

    setScene(s); setType(t); setBorough(b); setNeighborhood("");

    if (s || t !== "all" || b) {
      doFetch({ borough: b, neighborhood: "", scene: s, type: t, price: "all", pg: 1 });
    } else {
      // Navigated to /results with no params — reset to the "pick a filter" state
      setEvents([]); setTotal(0); setHasSearched(false);
    }
  }, [router.asPath]); // eslint-disable-line

  const cur = { borough, neighborhood, scene, type, price };
  const subNeighborhoods = NEIGHBORHOODS[borough] ?? [];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Metropolitan — Events</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <style>{`
        html, body, #__next, #__next > div { margin: 0; padding: 0; width: 100%; }
        select option, select optgroup { background: #fff8f0; color: #4a2008; }
        .dd-wrap { position: relative; display: inline-block; }
        .dd-wrap::after {
          content: "▾"; position: absolute; right: 0.6rem; top: 50%;
          transform: translateY(-50%); pointer-events: none;
          color: #7a3a10; font-size: 0.6rem;
        }
        .ev-card { transition: border-color 0.2s, background 0.2s; }
        .ev-card:hover { border-color: rgba(122,58,16,0.5) !important; background: rgba(255,248,235,0.88) !important; }
        .details-btn:hover { background: #5c2a08 !important; }
      `}</style>

      {/* Background */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, background: "#fdf6ee", zIndex: 0 }} />
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0,
        backgroundImage: "url('/watermark-bg.jpg')",
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.2, zIndex: 1, pointerEvents: "none",
      }} />

      {/* Page */}
      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <header style={{
          borderBottom: "1px solid rgba(90,50,20,0.15)",
          background: "rgba(253,246,238,0.85)",
          backdropFilter: "blur(8px)",
          padding: "0.875rem 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/home" style={{
            fontFamily: "var(--font-josefin), system-ui, sans-serif",
            fontSize: "0.62rem", letterSpacing: "0.28em",
            textTransform: "uppercase", color: "rgba(74,32,8,0.65)",
            textDecoration: "none",
          }}>
            ← Metropolitan
          </Link>
          <span style={{
            fontFamily: "var(--font-josefin), system-ui, sans-serif",
            fontSize: "0.6rem", letterSpacing: "0.22em",
            textTransform: "uppercase", color: "rgba(74,32,8,0.4)",
          }}>
            {loading ? "Loading…" : hasSearched ? `${total.toLocaleString()} events` : ""}
          </span>
        </header>

        {/* Filter bar */}
        <div style={{ padding: "2rem 1.5rem 1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <p style={{
            margin: 0,
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)",
            fontStyle: "italic",
            color: "rgba(74,32,8,0.6)",
          }}>
            Choose your filters to explore events
          </p>

          {/* Dropdowns — Borough first, then neighborhood if available, then filters */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.625rem" }}>

            {/* Step 1: Borough */}
            <div className="dd-wrap">
              <select value={borough} onChange={(e) => handleBoroughChange(e.target.value)} style={DD}>
                <option value="">Borough</option>
                {BOROUGHS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Step 2: Neighborhood — only shown when the selected borough has sub-neighborhoods */}
            {subNeighborhoods.length > 0 && (
              <div className="dd-wrap">
                <select value={neighborhood} onChange={(e) => handleNeighborhoodChange(e.target.value)} style={DD}>
                  <option value="">All {borough}</option>
                  {subNeighborhoods.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Your Scene */}
            <div className="dd-wrap">
              <select value={scene} onChange={(e) => handleChange("scene", e.target.value)} style={DD}>
                {SCENE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="dd-wrap">
              <select value={type} onChange={(e) => handleChange("type", e.target.value)} style={DD}>
                <option value="all">Type</option>
                {REFINE_TYPES.filter((t) => t.id !== "all").map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="dd-wrap">
              <select value={price} onChange={(e) => handleChange("price", e.target.value)} style={DD}>
                {PRICE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0 1.5rem", marginBottom: "1.5rem" }}>
          <span style={{ flex: 1, height: 1, background: "rgba(90,50,20,0.12)" }} />
          <span style={{ width: 6, height: 6, background: "#7a3a10", transform: "rotate(45deg)", display: "inline-block", opacity: 0.4 }} />
          <span style={{ flex: 1, height: 1, background: "rgba(90,50,20,0.12)" }} />
        </div>

        {/* Events area */}
        <div style={{ flex: 1, maxWidth: 1160, width: "100%", margin: "0 auto", padding: "0 1.25rem 3rem" }}>

          {!hasSearched ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 1rem", gap: "0.75rem" }}>
              <span style={{ width: 8, height: 8, background: "#7a3a10", transform: "rotate(45deg)", display: "inline-block", opacity: 0.3 }} />
              <p style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.05rem", fontStyle: "italic",
                color: "rgba(74,32,8,0.4)", margin: 0, textAlign: "center",
              }}>
                Select a filter above to discover events
              </p>
            </div>

          ) : loading && events.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
              <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1rem", fontStyle: "italic", color: "rgba(74,32,8,0.4)", margin: 0 }}>
                Loading events…
              </p>
            </div>

          ) : events.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
              <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1rem", fontStyle: "italic", color: "rgba(74,32,8,0.4)", margin: 0 }}>
                No events found — try adjusting your filters.
              </p>
            </div>

          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.875rem" }}>
                {events.map((ev) => <EventCard key={ev.id} event={ev} />)}
              </div>

              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1.5rem", marginTop: "2.5rem" }}>
                  <button
                    onClick={() => doFetch({ ...cur, pg: page - 1 })}

                    disabled={page <= 1 || loading}
                    style={{
                      border: "1px solid rgba(90,50,20,0.25)", background: "rgba(255,248,235,0.6)",
                      padding: "0.45rem 1.1rem",
                      fontFamily: "var(--font-josefin), system-ui, sans-serif",
                      fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
                      color: page <= 1 ? "rgba(74,32,8,0.25)" : "rgba(74,32,8,0.7)",
                      cursor: page <= 1 ? "not-allowed" : "pointer",
                    }}
                  >← Prev</button>
                  <span style={{ fontFamily: "var(--font-josefin), system-ui, sans-serif", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(74,32,8,0.4)" }}>
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => doFetch({ ...cur, pg: page + 1 })}

                    disabled={page >= totalPages || loading}
                    style={{
                      border: "1px solid rgba(90,50,20,0.25)", background: "rgba(255,248,235,0.6)",
                      padding: "0.45rem 1.1rem",
                      fontFamily: "var(--font-josefin), system-ui, sans-serif",
                      fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
                      color: page >= totalPages ? "rgba(74,32,8,0.25)" : "rgba(74,32,8,0.7)",
                      cursor: page >= totalPages ? "not-allowed" : "pointer",
                    }}
                  >Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Event Card ────────────────────────────────────────────────────────────────

function EventCard({ event }: { event: Event }) {
  const date     = formatEventDate(event.start_local);
  const time     = formatEventTime(event.start_local);
  const priceStr = formatPrice(event.is_free, event.price_min, event.price_max);
  const isFree   = priceStr === "Free";

  // Always provide a link: prefer the event URL, fall back to a Google search
  const linkUrl = event.url
    ? event.url
    : `https://www.google.com/search?q=${encodeURIComponent(
        [event.title, event.venue_name, "NYC"].filter(Boolean).join(" ")
      )}`;

  return (
    <article
      className="ev-card"
      style={{
        display: "flex", flexDirection: "column",
        border: "1px solid rgba(90,50,20,0.18)",
        background: "rgba(255,248,235,0.62)",
        backdropFilter: "blur(4px)",
        padding: "1rem 1.15rem",
      }}
    >
      <h3 style={{
        margin: "0 0 0.65rem",
        fontFamily: "var(--font-josefin), system-ui, sans-serif",
        fontSize: "0.76rem", fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: "#3a1800", lineHeight: 1.35,
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {event.title}
      </h3>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "0.88rem", color: "rgba(58,24,0,0.75)" }}>
          <span style={{ fontWeight: 600 }}>{date}</span>
          {time && <span style={{ fontStyle: "italic" }}> · {time}</span>}
        </p>

        {event.venue_name && (
          <p style={{ margin: 0, fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "0.82rem", fontStyle: "italic", color: "rgba(58,24,0,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {event.venue_name}
          </p>
        )}

        {event.borough && (
          <p style={{ margin: 0, fontFamily: "var(--font-josefin), system-ui, sans-serif", fontSize: "0.56rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(58,24,0,0.38)" }}>
            {event.borough}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.8rem", paddingTop: "0.8rem", borderTop: "1px solid rgba(90,50,20,0.1)" }}>
        <span style={{ fontFamily: "var(--font-josefin), system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: isFree ? "#2a6e2a" : "rgba(58,24,0,0.6)" }}>
          {priceStr}
        </span>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="details-btn"
          style={{ background: "#7a3a10", color: "#fdf6ee", padding: "0.3rem 0.8rem", fontFamily: "var(--font-josefin), system-ui, sans-serif", fontSize: "0.56rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", transition: "background 0.2s" }}
        >
          {event.url ? "Details →" : "Search →"}
        </a>
      </div>
    </article>
  );
}
