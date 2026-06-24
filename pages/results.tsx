import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { NEIGHBORHOODS, REFINE_TYPES } from "@/lib/constants";
import { formatEventDate, formatEventTime, formatPrice } from "@/lib/format";
import type { Event } from "@/lib/types";

const SCENE_LABELS: Record<string, string> = {
  "friends-night": "Friends Night",
  "with-kids": "With Kids",
  "date-night": "Date Night",
  solo: "Solo",
};

const SCENES = Object.entries(SCENE_LABELS);

export default function Results() {
  const router = useRouter();
  const { scene, type, q, borough: boroughParam } = router.query;

  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [selectedScene, setSelectedScene] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedBorough, setSelectedBorough] = useState<string>("All Neighborhoods");
  const [price, setPrice] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  // Sync filter state from URL on first load
  useEffect(() => {
    if (!router.isReady) return;
    if (scene && typeof scene === "string") setSelectedScene(scene);
    if (type && typeof type === "string") setSelectedType(type);
    if (boroughParam && typeof boroughParam === "string") setSelectedBorough(boroughParam);
    if (q && typeof q === "string") setQuery(q);
  }, [router.isReady, scene, type, boroughParam, q]);

  const fetchEvents = useCallback(async (pg: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "24",
        offset: String((pg - 1) * 24),
        ...(selectedScene && { scene: selectedScene }),
        ...(selectedType !== "all" && { type: selectedType }),
        ...(selectedBorough !== "All Neighborhoods" && { borough: selectedBorough }),
        ...(price !== "all" && { price }),
        ...(query.trim() && { q: query.trim() }),
      });
      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      setEvents(data.events ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedScene, selectedType, selectedBorough, price, query]);

  // Re-fetch when filters change
  useEffect(() => {
    if (!router.isReady) return;
    setPage(1);
    fetchEvents(1);
  }, [router.isReady, fetchEvents]);

  function handleFilterChange() {
    setPage(1);
    fetchEvents(1);
  }

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* Header */}
      <header className="border-b border-cream/10 bg-forest px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/home"
            className="flex items-center gap-2 text-xs tracking-widest text-cream/70 uppercase hover:text-cream"
          >
            <span className="deco-diamond" />
            <span className="font-semibold">Metropolitan</span>
          </Link>
          <span className="text-xs tracking-widest text-cream/40 uppercase">
            {loading ? "Loading…" : `${total.toLocaleString()} events`}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Search bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleFilterChange(); }}
          className="mb-8 flex"
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search events…`}
            className="flex-1 border border-cream/20 bg-ink/60 px-4 py-3 font-serif text-sm italic text-cream placeholder:text-cream/30 focus:border-lime/50 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-lime px-6 py-3 text-xs font-semibold tracking-widest text-ink uppercase hover:bg-lime-hover transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar filters */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-8">

              {/* Scene */}
              <div>
                <h3 className="mb-3 text-[10px] tracking-[0.3em] text-cream/40 uppercase">
                  Your scene
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => { setSelectedScene(""); handleFilterChange(); }}
                    className={`w-full text-left px-3 py-2 text-xs tracking-wider uppercase transition-colors ${
                      !selectedScene
                        ? "bg-lime text-ink font-semibold"
                        : "text-cream/60 hover:text-cream border border-cream/10 hover:border-cream/20"
                    }`}
                  >
                    All
                  </button>
                  {SCENES.map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => { setSelectedScene(id); handleFilterChange(); }}
                      className={`w-full text-left px-3 py-2 text-xs tracking-wider uppercase transition-colors ${
                        selectedScene === id
                          ? "bg-lime text-ink font-semibold"
                          : "text-cream/60 hover:text-cream border border-cream/10 hover:border-cream/20"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <h3 className="mb-3 text-[10px] tracking-[0.3em] text-cream/40 uppercase">
                  Type
                </h3>
                <div className="space-y-1">
                  {REFINE_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedType(t.id); handleFilterChange(); }}
                      className={`w-full text-left px-3 py-2 text-xs tracking-wider uppercase transition-colors ${
                        selectedType === t.id
                          ? "bg-lime text-ink font-semibold"
                          : "text-cream/60 hover:text-cream border border-cream/10 hover:border-cream/20"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Borough */}
              <div>
                <h3 className="mb-3 text-[10px] tracking-[0.3em] text-cream/40 uppercase">
                  Borough
                </h3>
                <select
                  value={selectedBorough}
                  onChange={(e) => { setSelectedBorough(e.target.value); handleFilterChange(); }}
                  className="w-full border border-cream/20 bg-ink px-3 py-2 text-xs text-cream/70 focus:border-lime/50 focus:outline-none"
                >
                  {NEIGHBORHOODS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <h3 className="mb-3 text-[10px] tracking-[0.3em] text-cream/40 uppercase">
                  Price
                </h3>
                <div className="space-y-2">
                  {[
                    { val: "all", label: "All" },
                    { val: "free", label: "Free only" },
                    { val: "paid", label: "Paid only" },
                  ].map(({ val, label }) => (
                    <label key={val} className="flex cursor-pointer items-center gap-2 text-xs text-cream/60">
                      <input
                        type="radio"
                        name="price"
                        value={val}
                        checked={price === val}
                        onChange={() => { setPrice(val); handleFilterChange(); }}
                        className="accent-lime"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Events grid */}
          <section className="lg:col-span-3">
            {loading && events.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <p className="font-serif italic text-cream/40">Loading events…</p>
              </div>
            ) : events.length === 0 ? (
              <div className="flex h-64 items-center justify-center border border-cream/10">
                <p className="font-serif italic text-cream/40">
                  No events found — try adjusting the filters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {events.map((ev) => (
                    <EventCard key={ev.id} event={ev} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-4">
                    <button
                      onClick={() => { setPage((p) => p - 1); fetchEvents(page - 1); }}
                      disabled={page <= 1 || loading}
                      className="border border-cream/20 px-4 py-2 text-[10px] tracking-widest text-cream/60 uppercase disabled:opacity-30 hover:border-cream/40 hover:text-cream transition-colors"
                    >
                      ← Prev
                    </button>
                    <span className="text-[10px] tracking-widest text-cream/40 uppercase">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => { setPage((p) => p + 1); fetchEvents(page + 1); }}
                      disabled={page >= totalPages || loading}
                      className="border border-cream/20 px-4 py-2 text-[10px] tracking-widest text-cream/60 uppercase disabled:opacity-30 hover:border-cream/40 hover:text-cream transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const date = formatEventDate(event.start_local);
  const time = formatEventTime(event.start_local);
  const price = formatPrice(event.is_free, event.price_min, event.price_max);

  return (
    <article className="flex flex-col border border-cream/10 bg-forest/20 p-5 transition-all hover:border-lime/30 hover:bg-forest/30">
      <h3 className="font-body text-sm font-semibold leading-snug tracking-wide text-cream uppercase line-clamp-2">
        {event.title}
      </h3>

      <div className="mt-3 space-y-1 font-serif text-sm text-cream/50">
        <p>
          <span className="text-cream/80">{date}</span>
          {time && <span className="italic"> · {time}</span>}
        </p>
        {event.borough && (
          <p className="text-[11px] tracking-wider uppercase text-cream/40">
            {event.borough}
          </p>
        )}
        {event.venue_name && (
          <p className="text-xs italic line-clamp-1 text-cream/50">
            {event.venue_name}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-cream/10 pt-4">
        <span className={`text-sm font-semibold tracking-wide uppercase ${
          price === "Free" ? "text-lime" : "text-cream/70"
        }`}>
          {price}
        </span>
        {event.url ? (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-lime px-4 py-1.5 text-[10px] font-semibold tracking-widest text-ink uppercase transition-colors hover:bg-lime-hover"
          >
            Details →
          </a>
        ) : (
          <span className="text-xs text-cream/30">No link</span>
        )}
      </div>
    </article>
  );
}
