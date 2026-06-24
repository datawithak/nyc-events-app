import type { EventType, Scene } from "./types";

export const NEIGHBORHOODS = [
  "All Neighborhoods",
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Bronx",
  "Staten Island",
] as const;

export const SCENES: {
  id: Scene;
  label: string;
  subtitle: string;
}[] = [
  {
    id: "friends-night",
    label: "Friends Night",
    subtitle: "Music · Comedy · Food",
  },
  {
    id: "with-kids",
    label: "With Kids",
    subtitle: "Outdoors · Family · Markets",
  },
  {
    id: "date-night",
    label: "Date Night",
    subtitle: "Theater · Art · Film",
  },
  {
    id: "solo",
    label: "Solo",
    subtitle: "Museums · Parks · Film",
  },
];

export const BROWSE_TYPES: { id: EventType; label: string }[] = [
  { id: "music", label: "Music" },
  { id: "art-culture", label: "Art & Culture" },
  { id: "food-drink", label: "Food & Drink" },
  { id: "theater", label: "Theater" },
  { id: "outdoor", label: "Outdoor" },
  { id: "comedy", label: "Comedy" },
  { id: "markets", label: "Markets" },
  { id: "film", label: "Film" },
];

export const REFINE_TYPES: { id: EventType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "music", label: "Music" },
  { id: "art-culture", label: "Art & Culture" },
  { id: "food-drink", label: "Food & Drink" },
  { id: "theater", label: "Theater" },
  { id: "comedy", label: "Comedy" },
  { id: "film", label: "Film" },
  { id: "sports-fitness", label: "Sports & Fitness" },
  { id: "outdoor", label: "Outdoor" },
  { id: "markets", label: "Markets" },
  { id: "kids-family", label: "Kids & Family" },
];

type QueryMap = { categories?: string[]; audiences?: string[] };

export const SCENE_QUERY_MAP: Record<Scene, QueryMap> = {
  "friends-night": {
    categories: ["music", "comedy", "food_drink", "food & drink"],
  },
  "with-kids": {
    audiences: ["kids", "family", "parents"],
    categories: ["outdoor", "family", "children", "markets", "community/civic"],
  },
  "date-night": {
    categories: ["theater", "theatre", "arts", "film", "musical"],
  },
  solo: {
    categories: ["arts", "museum", "outdoor", "parks", "film", "education"],
  },
};

export const TYPE_QUERY_MAP: Record<Exclude<EventType, "all">, QueryMap> = {
  music: {
    categories: ["music", "rock", "pop", "jazz", "alternative", "hip-hop"],
  },
  "art-culture": {
    categories: ["arts", "arts & theatre", "miscellaneous"],
  },
  "food-drink": {
    categories: ["food_drink", "food & drink"],
  },
  theater: {
    categories: ["theater", "theatre", "musical", "arts & theatre"],
  },
  comedy: {
    categories: ["comedy"],
  },
  film: {
    categories: ["film"],
  },
  "sports-fitness": {
    categories: ["sports", "fitness", "wellness"],
  },
  outdoor: {
    categories: ["outdoor", "parks", "community/civic"],
  },
  markets: {
    categories: ["markets", "community/civic", "miscellaneous"],
  },
  "kids-family": {
    audiences: ["kids", "family", "parents"],
    categories: ["family", "children", "education"],
  },
};

export const EVENTS_PER_PAGE = 24;

export function getSceneById(id: string) {
  return SCENES.find((s) => s.id === id);
}

export function getTypeLabel(id: EventType) {
  return REFINE_TYPES.find((t) => t.id === id)?.label ?? id;
}
