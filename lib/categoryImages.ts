/**
 * Category-based fallback images for event cards.
 *
 * HOW TO USE YOUR OWN PHOTOS:
 * 1. Drop 9–10 images into /public/images/ named exactly as below.
 * 2. Replace the Unsplash URLs in IMG with the local path, e.g. "/images/cat-music.jpg"
 *
 * Until you swap in your own photos the Unsplash defaults look great.
 */

const IMG: Record<string, string> = {
  music:      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=640&h=420&fit=crop&auto=format",
  electronic: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=640&h=420&fit=crop&auto=format",
  arts:       "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=640&h=420&fit=crop&auto=format",
  food:       "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=640&h=420&fit=crop&auto=format",
  theater:    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=640&h=420&fit=crop&auto=format",
  comedy:     "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=640&h=420&fit=crop&auto=format",
  film:       "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=640&h=420&fit=crop&auto=format",
  outdoor:    "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=640&h=420&fit=crop&auto=format",
  markets:    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=640&h=420&fit=crop&auto=format",
  kids:       "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=640&h=420&fit=crop&auto=format",
  // Default: NYC skyline / city vibe
  default:    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=640&h=420&fit=crop&auto=format",
};

// Priority-ordered rules: first keyword match wins.
const RULES: Array<{ keywords: string[]; key: keyof typeof IMG }> = [
  { keywords: ["electronic", "techno", "house", "dance", "edm", "dnb", "club night", "nightclub", "trance", "dubstep"], key: "electronic" },
  { keywords: ["music", "jazz", "rock", "pop", "hip-hop", "r&b", "folk", "classical", "country", "alternative", "concert"], key: "music" },
  { keywords: ["theater", "theatre", "musical", "broadway", "opera"], key: "theater" },
  { keywords: ["comedy", "stand-up", "improv"], key: "comedy" },
  { keywords: ["film", "movie", "cinema", "screening"], key: "film" },
  { keywords: ["arts", "art", "gallery", "exhibition", "museum"], key: "arts" },
  { keywords: ["food", "drink", "food_drink", "dining", "culinary", "market", "food & drink"], key: "food" },
  { keywords: ["kids", "family", "children", "child", "youth", "toddler", "baby"], key: "kids" },
  { keywords: ["festival", "fair", "flea", "markets", "craft fair"], key: "markets" },
  { keywords: ["outdoor", "outdoors", "parks", "park", "nature", "urban park"], key: "outdoor" },
];

/**
 * Returns the best image URL for an event.
 * Uses event.image_url if it has one; otherwise picks from the curated pool by category.
 */
export function getEventImage(event: {
  image_url?: string | null;
  categories?: string | null;
  audiences?: string | null;
}): string {
  if (event.image_url) return event.image_url;

  const haystack = `${event.categories ?? ""} ${event.audiences ?? ""}`.toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => haystack.includes(kw))) {
      return IMG[rule.key];
    }
  }

  return IMG.default;
}

/**
 * Deterministic image height (px) for masonry effect — varies by event id.
 * Creates visual rhythm without randomness: same event always renders the same height.
 */
export function getImageHeight(id: number): number {
  return [150, 195, 235][id % 3];
}
