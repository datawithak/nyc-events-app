import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PER_PAGE = 24;

// Manhattan sub-neighborhood → ZIP codes present in address strings
const NEIGHBORHOOD_ZIPS: Record<string, string[]> = {
  "Hudson Yards":      ["10001"],
  "Hell's Kitchen":    ["10036", "10019"],
  "Upper West Side":   ["10023", "10024", "10025"],
  "Upper East Side":   ["10021", "10028", "10065", "10075"],
  "Midtown":           ["10036", "10017", "10020", "10022", "10019"],
  "Murray Hill":       ["10016"],
  "NoMad":             ["10010"],
  "Rose Hill":         ["10010"],
  "Gramercy":          ["10003", "10010"],
  "Chelsea":           ["10001", "10011"],
  "West Village":      ["10014"],
  "SoHo":              ["10012", "10013"],
  "Tribeca":           ["10007", "10013"],
  "East Village":      ["10003", "10009"],
  "Lower East Side":   ["10002"],
  "Harlem":            ["10027", "10030", "10037", "10039"],
  "East Harlem":       ["10029", "10035"],
  "Washington Heights":["10032", "10033", "10034", "10040"],
  "Financial District":["10004", "10005", "10006", "10038"],
};

const SCENE_MAP: Record<string, { audiences?: string[]; categories?: string[] }> = {
  "friends-night":  { categories: ["music", "comedy", "food_drink"] },
  "with-kids":      { audiences: ["kids", "family", "parents"] },
  "date-night":     { categories: ["theater", "arts", "film"] },
  solo:             { categories: ["arts", "outdoor", "film", "education"] },
};

const TYPE_MAP: Record<string, { categories?: string[] }> = {
  music:            { categories: ["music", "rock", "pop", "jazz"] },
  "art-culture":    { categories: ["arts", "arts & theatre"] },
  "food-drink":     { categories: ["food_drink", "food & drink"] },
  theater:          { categories: ["theater", "theatre", "musical"] },
  comedy:           { categories: ["comedy"] },
  film:             { categories: ["film"] },
  "sports-fitness": { categories: ["sports", "fitness"] },
  outdoor:          { categories: ["outdoor", "parks"] },
  markets:          { categories: ["markets"] },
  "kids-family":    { categories: ["kids", "family", "children"] },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const {
    scene,
    type,
    borough,
    price,
    q,
    limit: limitQ = String(PER_PAGE),
    offset: offsetQ = "0",
  } = req.query as Record<string, string>;

  const limit = Math.min(parseInt(limitQ) || PER_PAGE, 100);
  const offset = parseInt(offsetQ) || 0;

  try {
    let query = supabase
      .from("events")
      .select(
        "id,title,url,image_url,start_local,end_utc,venue_name,address,borough,is_free,price_min,price_max,currency,categories,audiences,description",
        { count: "exact" }
      )
      .gte("start_utc", new Date().toISOString())
      .order("start_utc", { ascending: true });

    // ── Location filter ───────────────────────────────────────────────────────
    if (borough && borough !== "All Neighborhoods" && borough !== "") {
      if (borough.startsWith("nbhd:")) {
        // Sub-neighborhood: restrict to Manhattan then filter by ZIP codes
        const nbhd = borough.replace("nbhd:", "");
        const zips = NEIGHBORHOOD_ZIPS[nbhd] ?? [];
        query = query.eq("borough", "Manhattan");
        if (zips.length > 0) {
          const zipParts = zips.map((z) => `address.ilike.%${z}%`);
          query = query.or(zipParts.join(","));
        }
      } else {
        // Full borough
        query = query.eq("borough", borough);
      }
    }

    // ── Price filter ──────────────────────────────────────────────────────────
    if (price === "free") {
      query = query.eq("is_free", 1);
    } else if (price === "paid") {
      query = query.neq("is_free", 1);
    }

    // ── Free-text search ──────────────────────────────────────────────────────
    if (q?.trim()) {
      query = query.or(
        `title.ilike.%${q}%,description.ilike.%${q}%,venue_name.ilike.%${q}%`
      );
    }

    // ── Scene filter ──────────────────────────────────────────────────────────
    if (scene && scene in SCENE_MAP) {
      const map = SCENE_MAP[scene];
      const orParts: string[] = [];
      for (const term of map.categories ?? []) orParts.push(`categories.ilike.%${term}%`);
      for (const term of map.audiences ?? []) orParts.push(`audiences.ilike.%${term}%`);
      if (orParts.length) query = query.or(orParts.join(","));
    }

    // ── Type filter ───────────────────────────────────────────────────────────
    if (type && type !== "all" && type in TYPE_MAP) {
      const map = TYPE_MAP[type];
      const orParts: string[] = [];
      for (const term of map.categories ?? []) orParts.push(`categories.ilike.%${term}%`);
      if (orParts.length) query = query.or(orParts.join(","));
    }

    // ── Pagination ────────────────────────────────────────────────────────────
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    const total = count ?? 0;
    return res.status(200).json({
      events: data ?? [],
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      page: Math.floor(offset / limit) + 1,
    });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
