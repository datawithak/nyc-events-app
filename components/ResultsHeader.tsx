"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { NEIGHBORHOODS } from "@/lib/constants";
import type { PriceFilter } from "@/lib/types";

export default function ResultsHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const neighborhood = searchParams.get("neighborhood") ?? "All Neighborhoods";
  const price = (searchParams.get("price") ?? "all") as PriceFilter;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "All Neighborhoods") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/events?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-10 bg-forest">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-[10px] tracking-widest text-cream/70 uppercase transition-colors hover:text-lime"
        >
          <span className="deco-diamond shrink-0" />
          Metropolitan
        </Link>

        <Link
          href="/"
          className="text-xs text-cream/50 transition-colors hover:text-cream"
        >
          ← Back
        </Link>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <select
            value={neighborhood}
            onChange={(e) => updateParam("neighborhood", e.target.value)}
            className="border border-cream/20 bg-forest-light px-3 py-2 text-[10px] tracking-wider text-cream uppercase focus:outline-none"
          >
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <div className="flex border border-cream/20 text-[10px] tracking-wider uppercase">
            {(["all", "free", "paid"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateParam("price", p)}
                className={`px-3 py-2 font-semibold transition-colors ${
                  price === p
                    ? "bg-lime text-forest"
                    : "text-cream/70 hover:text-cream"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
