export interface Event {
  id: number;
  title: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  start_local: string | null;
  end_local: string | null;
  venue_name: string | null;
  address: string | null;
  borough: string | null;
  is_free: number | null;
  price_min: number | null;
  price_max: number | null;
  currency: string | null;
  categories: string | null;
  audiences: string | null;
}

export type Scene =
  | "friends-night"
  | "with-kids"
  | "date-night"
  | "solo";

export type EventType =
  | "all"
  | "music"
  | "electronic"
  | "art-culture"
  | "food-drink"
  | "theater"
  | "comedy"
  | "film"
  | "sports-fitness"
  | "outdoor"
  | "markets"
  | "kids-family";

export type PriceFilter = "all" | "free" | "paid";

export interface SearchParams {
  q?: string;
  scene?: Scene;
  type?: EventType;
  neighborhood?: string;
  price?: PriceFilter;
  page?: string;
}
