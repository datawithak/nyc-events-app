import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseParams: Record<string, string | undefined>;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(baseParams)) {
      if (value) params.set(key, value);
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/events${qs ? `?${qs}` : ""}`;
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-3">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="border border-forest/20 px-4 py-2 text-[10px] tracking-widest text-forest uppercase hover:bg-white"
        >
          ← Prev
        </Link>
      )}
      <span className="text-[10px] tracking-widest text-muted uppercase">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="border border-forest/20 px-4 py-2 text-[10px] tracking-widest text-forest uppercase hover:bg-white"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}
