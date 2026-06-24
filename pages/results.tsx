import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { REFINE_TYPES } from "@/lib/constants";
import { formatEventDate, formatEventTime, formatPrice } from "@/lib/format";
import type { Event } from "@/lib/types";

// ─── Dropdown options ──────────────────────────────────────────────────────────

const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

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

// Shared dropdown style — forest green palette
const DD: React.CSSProperties = {
  border: "1px solid rgba(30,70,40,0.3)",
  background: "rgba(240,248,242,0.75)",
  backdropFilter: "blur(4px)",
  padding: "0.55rem 2rem 0.55rem 0.85rem",
  fontFamily: "var(--font-josefin), system-ui, sans-serif",
  fontSize: "clamp(0.58rem, 1.6vw, 0.7rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#1a3a2a",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  minWidth: "152px",
  outline: "none",
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Results() {
  const router = useRouter();

  // Filter state
  const [borough, setBorough]           = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [scene, setScene]               = useState("");
  const [type, setType]                 = useState("all");
  const [price, setPrice]               = useState("all");
  const [query, setQuery]               = useState("");

  // Search input ref for controlled input
  const searchRef = useRef<HTMLInputElement>(null);

  // Derived API location param
  function locationParam(b: string, n: string) {
    if (n) return `nbhd:${n}`;
    return b;
  }

  // Results
  const [events, setEvents]           = useState<Event[]>([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [loading, setLoading]         = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ── helpers ────────────────────────────────────────────────────────────────

  function isDefault(f: { borough: string; neighborhood: string; scene: string; type: string; price: string; query: string }) {
    return !f.borough && !f.neighborhood && !f.scene && f.type === "all" && f.price === "all" && !f.query.trim();
  }

  async function doFetch(opts: {
    borough: string; neighborhood: string; scene: string; type: string; price: string; query: string; pg: number;
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
      if (loc)             p.set("borough", loc);
      if (opts.scene)      p.set("scene", opts.scene);
      if (opts.type !== "all") p.set("type", opts.type);
      if (opts.price !== "all") p.set("price", opts.price);
      if (opts.query.trim()) p.set("q", opts.query.trim());

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

  function handleBoroughChange(value: string) {
    setBorough(value);
    setNeighborhood("");
    doFetch({ borough: value, neighborhood: "", scene, type, price, query, pg: 1 });
  }

  function handleNeighborhoodChange(value: string) {
    setNeighborhood(value);
    doFetch({ borough, neighborhood: value, scene, type, price, query, pg: 1 });
  }

  function handleChange(field: "scene" | "type" | "price", value: string) {
    const next = {
      borough, neighborhood,
      scene: field === "scene" ? value : scene,
      type:  field === "type"  ? value : type,
      price: field === "price" ? value : price,
      query,
    };
    setScene(next.scene); setType(next.type); setPrice(next.price);
    doFetch({ ...next, pg: 1 });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchRef.current?.value ?? "";
    setQuery(q);
    doFetch({ borough, neighborhood, scene, type, price, query: q, pg: 1 });
  }

  // ── Sync URL params → state & auto-fetch when URL changes ───────────────────
  useEffect(() => {
    if (!router.isReady) return;
    const s = (router.query.scene as string) || "";
    const t = (router.query.type  as string) || "all";
    const b = (router.query.borough as string) || "";

    setScene(s); setType(t); setBorough(b); setNeighborhood(""); setQuery("");
    if (searchRef.current) searchRef.current.value = "";

    if (s || t !== "all" || b) {
      doFetch({ borough: b, neighborhood: "", scene: s, type: t, price: "all", query: "", pg: 1 });
    } else {
      setEvents([]); setTotal(0); setHasSearched(false);
    }
  }, [router.asPath]); // eslint-disable-line

  const cur = { borough, neighborhood, scene, type, price, query };
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
        select option, select optgroup { background: #f0f8f2; color: #1a3a2a; }
        .dd-wrap { position: relative; display: inline-block; }
        .dd-wrap::after {
          content: "▾"; position: absolute; right: 0.6rem; top: 50%;
          transform: translateY(-50%); pointer-events: none;
          color: #3a6642; font-size: 0.6rem;
        }
        .ev-card { transition: border-color 0.2s, background 0.2s; }
        .ev-card:hover { border-color: rgba(40,90,50,0.5) !important; background: rgba(240,248,242,0.92) !important; }
        .details-btn:hover { background: #2a5035 !important; }
        .search-input::placeholder { color: rgba(20,60,30,0.38); }
        .search-input:focus { outline: none; border-color: rgba(40,90,50,0.55) !important; }
      `}</style>

      {/* Background — sage green palette */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, background: "#f4f7f0", zIndex: 0 }} />
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0,
        backgroundImage: "url('/home-bg.jpg')",
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.4, zIndex: 1, pointerEvents: "none",
      }} />

      {/* Page */}
      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <header style={{
          borderBottom: "1px solid rgba(30,70,40,0.15)",
          background: "rgba(244,247,240,0.88)",
          backdropFilter: "blur(8px)",
          padding: "0.875rem 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/home" style={{
            fontFamily: "var(--font-josefin), system-ui, sans-serif",
            fontSize: "0.62rem", letterSpacing: "0.28em",
            textTransform: "uppercase", color: "rgba(20,60,30,0.65)",
            textDecoration: "none",
          }}>
            ← Metropolitan
          </Link>
          <span style={{
            fontFamily: "var(--font-josefin), system-ui, sans-serif",
            fontSize: "0.6rem", letterSpacing: "0.22em",
            textTransform: "uppercase", color: "rgba(20,60,30,0.4)",
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
            color: "rgba(20,60,30,0.6)",
          }}>
            Choose your filters to explore events
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ width: "100%", maxWidth: 480, display: "flex", gap: "0.5rem" }}>
            <input
              ref={searchRef}
              type="text"
              className="search-input"
              placeholder="Search events, venues, artists…"
              defaultValue={query}
              style={{
                flex: 1,
                border: "1px solid rgba(30,70,40,0.3)",
                background: "rgba(240,248,242,0.75)",
                backdropFilter: "blur(4px)",
                padding: "0.55rem 0.85rem",
                fontFamily: "var(--font-josefin), system-ui, sans-serif",
                fontSize: "clamp(0.58rem, 1.6vw, 0.7rem)",
                letterSpacing: "0.1em",
                color: "#1a3a2a",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
            <button type="submit" style={{
              border: "1px solid rgba(30,70,40,0.3)",
              background: "#3a6642",
              color: "#f4f7f0",
              padding: "0.55rem 1.1rem",
              fontFamily: "var(--font-josefin), system-ui, sans-serif",
              fontSize: "0.6rem", letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background 0.2s",
            }}>
              Search
            </button>
          </form>

          {/* Dropdowns */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.625rem" }}>

            {/* Borough */}
            <div className="dd-wrap">
              <select value={borough} onChange={(e) => handleBoroughChange(e.target.value)} style={DD}>
                <option value="">Borough</option>
                {BOROUGHS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Neighborhood — only shown when borough has sub-neighborhoods */}
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

            {/* Scene */}
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
          <span style={{ flex: 1, height: 1, background: "rgba(30,70,40,0.12)" }} />
          <span style={{ width: 6, height: 6, background: "#3a6642", transform: "rotate(45deg)", display: "inline-block", opacity: 0.4 }} />
          <span style={{ flex: 1, height: 1, background: "rgba(30,70,40,0.12)" }} />
        </div>

        {/* Events area */}
        <div style={{ flex: 1, maxWidth: 1160, width: "100%", margin: "0 auto", padding: "0 1.25rem 3rem" }}>

          {!hasSearched ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 1rem", gap: "0.75rem" }}>
              <span style={{ width: 8, height: 8, background: "#3a6642", transform: "rotate(45deg)", display: "inline-block", opacity: 0.3 }} />
              <p style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.05rem", fontStyle: "italic",
                color: "rgba(20,60,30,0.4)", margin: 0, textAlign: "center",
              }}>
                Select a filter or search above to discover events
              </p>
              <p style={{
                fontFamily: "var(--font-josefin), system-ui, sans-serif",
                fontSize: "0.58rem", letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(20,60,30,0.3)", margin: 0, textAlign: "center",
              }}>
                Tip: combine filters — e.g. search "jazz" with Scene → With Kids
              </p>
            </div>

          ) : loading && events.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
              <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1rem", fontStyle: "italic", color: "rgba(20,60,30,0.4)", margin: 0 }}>
                Loading events…
              </p>
            </div>

          ) : events.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
              <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1rem", fontStyle: "italic", color: "rgba(20,60,30,0.4)", margin: 0 }}>
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
                      border: "1px solid rgba(30,70,40,0.25)", background: "rgba(240,248,242,0.6)",
                      padding: "0.45rem 1.1rem",
                      fontFamily: "var(--font-josefin), system-ui, sans-serif",
                      fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
                      color: page <= 1 ? "rgba(20,60,30,0.25)" : "rgba(20,60,30,0.7)",
                      cursor: page <= 1 ? "not-allowed" : "pointer",
                    }}
                  >← Prev</button>
                  <span style={{ fontFamily: "var(--font-josefin), system-ui, sans-serif", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(20,60,30,0.4)" }}>
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => doFetch({ ...cur, pg: page + 1 })}
                    disabled={page >= totalPages || loading}
                    style={{
                      border: "1px solid rgba(30,70,40,0.25)", background: "rgba(240,248,242,0.6)",
                      padding: "0.45rem 1.1rem",
                      fontFamily: "var(--font-josefin), system-ui, sans-serif",
                      fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
                      color: page >= totalPages ? "rgba(20,60,30,0.25)" : "rgba(20,60,30,0.7)",
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
        border: "1px solid rgba(30,70,40,0.18)",
        background: "rgba(240,248,242,0.62)",
        backdropFilter: "blur(4px)",
        padding: "1rem 1.15rem",
      }}
    >
      <h3 style={{
        margin: "0 0 0.65rem",
        fontFamily: "var(--font-josefin), system-ui, sans-serif",
        fontSize: "0.76rem", fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: "#1a3a2a", lineHeight: 1.35,
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {event.title}
      </h3>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "0.88rem", color: "rgba(20,60,30,0.75)" }}>
          <span style={{ fontWeight: 600 }}>{date}</span>
          {time && <span style={{ fontStyle: "italic" }}> · {time}</span>}
        </p>

        {event.venue_name && (
          <p style={{ margin: 0, fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "0.82rem", fontStyle: "italic", color: "rgba(20,60,30,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {event.venue_name}
          </p>
        )}

        {event.borough && (
          <p style={{ margin: 0, fontFamily: "var(--font-josefin), system-ui, sans-serif", fontSize: "0.56rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(20,60,30,0.38)" }}>
            {event.borough}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.8rem", paddingTop: "0.8rem", borderTop: "1px solid rgba(30,70,40,0.1)" }}>
        <span style={{ fontFamily: "var(--font-josefin), system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: isFree ? "#2a6e2a" : "rgba(20,60,30,0.6)" }}>
          {priceStr}
        </span>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="details-btn"
          style={{ background: "#3a6642", color: "#f4f7f0", padding: "0.3rem 0.8rem", fontFamily: "var(--font-josefin), system-ui, sans-serif", fontSize: "0.56rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", transition: "background 0.2s" }}
        >
          {event.url ? "Details →" : "Search →"}
        </a>
      </div>
    </article>
  );
}
