"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import MetropolitanHeader from "@/components/MetropolitanHeader";
import {
  NEIGHBORHOODS,
  REFINE_TYPES,
  getSceneById,
  getTypeLabel,
} from "@/lib/constants";
import type { EventType, PriceFilter, Scene } from "@/lib/types";

export default function RefineForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sceneParam = searchParams.get("scene") as Scene | null;
  const typeParam = (searchParams.get("type") as EventType) ?? "all";

  const scene = sceneParam ? getSceneById(sceneParam) : null;

  const [neighborhood, setNeighborhood] = useState("All Neighborhoods");
  const [type, setType] = useState<EventType>(typeParam);
  const [price, setPrice] = useState<PriceFilter>("all");
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const heading = scene
    ? scene.label.toUpperCase()
    : typeParam !== "all"
      ? getTypeLabel(typeParam).toUpperCase()
      : "ALL EVENTS";

  const subtitle = scene?.subtitle ?? "";

  const fetchCount = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sceneParam) params.set("scene", sceneParam);
    if (type !== "all") params.set("type", type);
    if (neighborhood !== "All Neighborhoods") params.set("neighborhood", neighborhood);
    if (price !== "all") params.set("price", price);

    const res = await fetch(`/api/events/count?${params}`);
    const data = await res.json();
    setCount(data.count);
    setLoading(false);
  }, [sceneParam, type, neighborhood, price]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  function handleDiscover() {
    const params = new URLSearchParams();
    if (sceneParam) params.set("scene", sceneParam);
    if (type !== "all") params.set("type", type);
    if (neighborhood !== "All Neighborhoods") params.set("neighborhood", neighborhood);
    if (price !== "all") params.set("price", price);
    router.push(`/events?${params}`);
  }

  return (
    <div className="min-h-screen bg-cream">
      <MetropolitanHeader showProgress progressStep={2} rightLabel="Refine" />

      <div className="mx-auto max-w-lg px-4 py-10 sm:py-14">
        <p className="text-center font-serif text-sm italic text-muted">
          You&apos;re planning
        </p>

        <div className="deco-divider my-4 text-xs tracking-widest text-forest uppercase">
          <span className="deco-diamond shrink-0" />
        </div>

        <h1 className="text-center font-body text-3xl font-semibold tracking-widest text-forest uppercase sm:text-4xl">
          {heading}
        </h1>
        {subtitle && (
          <p className="mt-2 text-center font-serif text-sm italic text-muted">
            {subtitle}
          </p>
        )}

        <div className="mt-10 border border-cream-dark bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <label className="mb-2 block text-[10px] font-semibold tracking-widest text-muted uppercase">
              Neighborhood
            </label>
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full border border-forest/20 bg-cream/30 px-4 py-3 text-sm tracking-wide text-forest uppercase focus:border-forest focus:outline-none"
            >
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n === "All Neighborhoods" ? "All Neighborhoods" : n}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="mb-3 block text-[10px] font-semibold tracking-widest text-muted uppercase">
              Activity Type
            </label>
            <div className="flex flex-wrap gap-2">
              {REFINE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`border px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                    type === t.id
                      ? "border-forest bg-forest text-cream"
                      : "border-forest/20 text-forest/70 hover:border-forest/40"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="mb-3 block text-[10px] font-semibold tracking-widest text-muted uppercase">
              Price
            </label>
            <div className="flex gap-0 border border-forest/20">
              {(["all", "free", "paid"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrice(p)}
                  className={`flex-1 py-2.5 text-[10px] font-semibold tracking-widest uppercase transition-colors ${
                    price === p
                      ? "bg-forest text-cream"
                      : "bg-white text-forest/70 hover:bg-cream/50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleDiscover}
            disabled={loading}
            className="w-full bg-lime py-4 text-sm font-semibold tracking-widest text-forest uppercase transition-colors hover:bg-lime-hover disabled:opacity-60"
          >
            {loading
              ? "Loading..."
              : `Discover ${count?.toLocaleString() ?? 0} Events ›`}
          </button>
        </div>
      </div>
    </div>
  );
}
