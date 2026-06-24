import { getDb } from "./db";
import {
  EVENTS_PER_PAGE,
  NEIGHBORHOODS,
  SCENE_QUERY_MAP,
  TYPE_QUERY_MAP,
} from "./constants";
import type { Event, EventType, Scene, SearchParams } from "./types";

type QueryMap = { categories?: string[]; audiences?: string[] };

function buildOrConditions(
  mapping: QueryMap,
  prefix: "AND" | "OR" = "AND"
): { sql: string; params: string[] } {
  const clauses: string[] = [];
  const params: string[] = [];

  for (const term of mapping.categories ?? []) {
    clauses.push("categories LIKE ?");
    params.push(`%${term}%`);
  }
  for (const term of mapping.audiences ?? []) {
    clauses.push("audiences LIKE ?");
    params.push(`%${term}%`);
  }

  if (clauses.length === 0) return { sql: "", params: [] };
  return { sql: `${prefix} (${clauses.join(" OR ")})`, params };
}

function buildSearchQuery(params: SearchParams): {
  where: string;
  extraSql: string;
  queryParams: (string | number)[];
} {
  const conditions: string[] = ["start_local >= datetime('now', '-1 day')"];
  const queryParams: (string | number)[] = [];
  let extraSql = "";

  if (params.q?.trim()) {
    const term = `%${params.q.trim()}%`;
    conditions.push(
      "(title LIKE ? OR description LIKE ? OR venue_name LIKE ?)"
    );
    queryParams.push(term, term, term);
  }

  if (
    params.neighborhood &&
    params.neighborhood !== "All Neighborhoods" &&
    NEIGHBORHOODS.includes(
      params.neighborhood as (typeof NEIGHBORHOODS)[number]
    )
  ) {
    conditions.push("borough = ?");
    queryParams.push(params.neighborhood);
  }

  if (params.price === "free") {
    conditions.push("is_free = 1");
  } else if (params.price === "paid") {
    conditions.push("(is_free IS NULL OR is_free = 0)");
  }

  if (params.scene && params.scene in SCENE_QUERY_MAP) {
    const { sql, params: p } = buildOrConditions(
      SCENE_QUERY_MAP[params.scene],
      "AND"
    );
    extraSql += ` ${sql}`;
    queryParams.push(...p);
  }

  if (params.type && params.type !== "all" && params.type in TYPE_QUERY_MAP) {
    const { sql, params: p } = buildOrConditions(
      TYPE_QUERY_MAP[params.type],
      "AND"
    );
    extraSql += ` ${sql}`;
    queryParams.push(...p);
  }

  return { where: conditions.join(" AND "), extraSql, queryParams };
}

export function countEvents(params: SearchParams): number {
  const db = getDb();
  const { where, extraSql, queryParams } = buildSearchQuery(params);
  return (
    db
      .prepare(`SELECT COUNT(*) as count FROM events WHERE ${where}${extraSql}`)
      .get(...queryParams) as { count: number }
  ).count;
}

export function getEventsThisWeek(): number {
  const db = getDb();
  return (
    db
      .prepare(
        `SELECT COUNT(*) as count FROM events
         WHERE start_local >= datetime('now', '-1 day')
           AND start_local <= datetime('now', '+7 days')`
      )
      .get() as { count: number }
  ).count;
}

export function searchEvents(params: SearchParams): {
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
} {
  const db = getDb();
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const offset = (page - 1) * EVENTS_PER_PAGE;
  const { where, extraSql, queryParams } = buildSearchQuery(params);

  const total = (
    db
      .prepare(`SELECT COUNT(*) as count FROM events WHERE ${where}${extraSql}`)
      .get(...queryParams) as { count: number }
  ).count;
  const totalPages = Math.max(1, Math.ceil(total / EVENTS_PER_PAGE));

  const events = db
    .prepare(
      `SELECT id, title, description, url, image_url, start_local, end_utc as end_local,
              venue_name, address, borough, is_free, price_min, price_max, currency,
              categories, audiences
       FROM events
       WHERE ${where}${extraSql}
       ORDER BY start_local ASC
       LIMIT ? OFFSET ?`
    )
    .all(...queryParams, EVENTS_PER_PAGE, offset) as Event[];

  return { events, total, page, totalPages };
}
