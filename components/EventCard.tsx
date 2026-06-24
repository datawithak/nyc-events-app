import type { Event } from "@/lib/types";
import { formatEventDate, formatEventTime, formatPrice } from "@/lib/format";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const date = formatEventDate(event.start_local);
  const time = formatEventTime(event.start_local);
  const price = formatPrice(event.is_free, event.price_min, event.price_max);

  return (
    <article className="flex flex-col border border-cream-dark bg-white p-5 transition-shadow hover:shadow-md">
      <h3 className="font-body text-base font-semibold leading-snug tracking-wide text-forest uppercase line-clamp-2">
        {event.title}
      </h3>

      <div className="mt-3 space-y-1 font-serif text-sm text-muted">
        <p>
          <span className="text-forest">{date}</span>
          {time && <span className="italic"> · {time}</span>}
        </p>
        {event.borough && (
          <p className="text-[11px] tracking-wider uppercase">{event.borough}</p>
        )}
        {event.venue_name && (
          <p className="text-xs italic line-clamp-1">{event.venue_name}</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-cream-dark pt-4">
        <span
          className={`text-sm font-semibold tracking-wide uppercase ${
            price === "Free" ? "text-lime-hover" : "text-forest"
          }`}
        >
          {price}
        </span>
        {event.url ? (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-lime px-4 py-1.5 text-[10px] font-semibold tracking-widest text-forest uppercase transition-colors hover:bg-lime-hover"
          >
            Get Tickets
          </a>
        ) : (
          <span className="text-xs text-muted">No link</span>
        )}
      </div>
    </article>
  );
}
