export function formatEventDate(dateStr: string | null): string {
  if (!dateStr) return "Date TBA";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatEventTime(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function formatPrice(
  isFree: number | null,
  priceMin: number | null,
  priceMax: number | null
): string {
  if (isFree === 1) return "Free";
  if (priceMin != null && priceMax != null && priceMin !== priceMax) {
    return `$${priceMin} – $${priceMax}`;
  }
  if (priceMin != null) return `$${priceMin}`;
  if (priceMax != null) return `$${priceMax}`;
  return "Paid";
}
