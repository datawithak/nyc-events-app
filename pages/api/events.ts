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
  // Brooklyn
  "Williamsburg":      ["11206", "11211", "11249"],
  "DUMBO":             ["11201"],
  "Brooklyn Heights":  ["11201"],
  "Park Slope":        ["11215", "11217"],
  "Crown Heights":     ["11213", "11225"],
  "Bushwick":          ["11207", "11221", "11237"],
  "Bed-Stuy":          ["11216", "11221", "11233"],
  "Cobble Hill":       ["11201"],
  "Prospect Heights":  ["11217", "11238"],
  "Red Hook":          ["11231"],
  "Sunset Park":       ["11220", "11232"],
  "Bay Ridge":         ["11209"],
  // Queens
  "Astoria":           ["11102", "11103", "11105", "11106"],
  "Long Island City":  ["11101", "11102"],
  "Flushing":          ["11354", "11355", "11358"],
  "Jamaica":           ["11432", "11433", "11434", "11435"],
  "Forest Hills":      ["11375"],
  "Jackson Heights":   ["11372"],
  "Ridgewood":         ["11385"],
};

// ── Scene map ────────────────────────────────────────────────────────────────
// Expanded to match both explicit audience tags AND family-friendly categories.
// "with-kids" now also catches outdoor/parks/festival events which are
// naturally family-friendly even without explicit audience tags.
const SCENE_MAP: Record<string, { audiences?: string[]; categories?: string[] }> = {
  // "nightlife" removed — too broad, catches playground "PARTY" permits.
  // Legitimate nightlife events from RA are also tagged "electronic"/"music"/"dance".
  "friends-night":  { categories: ["music", "comedy", "food_drink", "electronic", "dance"] },
  "with-kids": {
    audiences: ["kids", "family", "parents"],
    categories: ["outdoor", "parks", "festival", "community", "public", "family", "children", "education"],
  },
  "date-night":     { categories: ["theater", "arts", "film"] },
  solo:             { categories: ["arts", "outdoor", "film", "education"] },
};

// ── Type map ─────────────────────────────────────────────────────────────────
const TYPE_MAP: Record<string, { categories?: string[] }> = {
  music:            { categories: ["music", "rock", "pop", "jazz", "alternative", "hip-hop", "r&b", "country", "classical", "folk"] },
  // "nightlife" alone is too broad (catches playground "PARTY" permits from NYC Open Data).
  // RA events are also tagged "electronic" and "music" so they still surface without it.
  electronic:       { categories: ["electronic", "dance", "edm", "house", "techno", "drum and bass", "dnb", "trance", "dubstep", "club night", "nightclub"] },
  "art-culture":    { categories: ["arts", "arts & theatre", "gallery", "exhibition"] },
  "food-drink":     { categories: ["food_drink", "food & drink"] },
  theater:          { categories: ["theater", "theatre", "musical"] },
  comedy:           { categories: ["comedy"] },
  film:             { categories: ["film"] },
  "sports-fitness": { categories: ["sports", "fitness", "wellness"] },
  outdoor:          { categories: ["outdoor", "parks"] },
  markets:          { categories: ["markets", "festival"] },
  "kids-family":    { categories: ["kids", "family", "children"] },
};

// ── Date helpers ─────────────────────────────────────────────────────────────
// Returns YYYY-MM-DD for a date offset from today in New York time.
function nyDateStr(daysOffset = 0): string {
  const nowNY = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  nowNY.setDate(nowNY.getDate() + daysOffset);
  return [
    nowNY.getFullYear(),
    String(nowNY.getMonth() + 1).padStart(2, "0"),
    String(nowNY.getDate()).padStart(2, "0"),
  ].join("-");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const {
    scene,
    type,
    borough,
    price,
    date,
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
        const nbhd = borough.replace("nbhd:", "");
        const zips = NEIGHBORHOOD_ZIPS[nbhd] ?? [];
        if (zips.length > 0) {
          const zipParts = zips.map((z) => `address.ilike.%${z}%`);
          query = query.or(zipParts.join(","));
        }
      } else {
        query = query.eq("borough", borough);
      }
    }

    // ── Price filter ──────────────────────────────────────────────────────────
    // Include both is_free=1 AND price_min=0 (catches events where price data
    // exists but is_free wasn't explicitly set to true by the scraper).
    if (price === "free") {
      query = query.or("is_free.eq.1,price_min.eq.0");
    } else if (price === "paid") {
      query = query.neq("is_free", 1);
    }

    // ── Free-text search ──────────────────────────────────────────────────────
    if (q?.trim()) {
      query = query.or(
        `title.ilike.%${q}%,description.ilike.%${q}%,venue_name.ilike.%${q}%`
      );
    }

    // ── Date filter ───────────────────────────────────────────────────────────
    // Uses start_local (NY timezone ISO string) for date-level comparisons.
    // String comparison works because start_local is YYYY-MM-DD... formatted.
    if (date && date !== "all") {
      const today = nyDateStr(0);
      const tomorrow = nyDateStr(1);

      if (date === "today") {
        query = query.gte("start_local", today).lt("start_local", tomorrow);
      } else if (date === "tomorrow") {
        query = query.gte("start_local", tomorrow).lt("start_local", nyDateStr(2));
      } else if (date === "weekend") {
        // Find the upcoming Saturday (or today if it's Saturday)
        const nowNY = new Date(
          new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
        );
        const dayOfWeek = nowNY.getDay(); // 0=Sun, 1=Mon … 6=Sat
        // days until Saturday (0 if today is Sat, 1 if today is Sun so next Sat is 6 days)
        const daysToSat = dayOfWeek === 6 ? 0 : (6 - dayOfWeek) % 7;
        // If today is Sunday (0), daysToSat = 6, but we want THIS weekend = today + tomorrow
        const satStr = dayOfWeek === 0 ? today : nyDateStr(daysToSat);
        const monStr = dayOfWeek === 0 ? tomorrow : nyDateStr(daysToSat + 2);
        query = query.gte("start_local", satStr).lt("start_local", monStr);
      } else if (date === "week") {
        query = query.lt("start_local", nyDateStr(7));
      } else if (date === "month") {
        query = query.lt("start_local", nyDateStr(30));
      }
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
