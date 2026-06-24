import { useRouter } from "next/router";
import { useState } from "react";

export default function LandingSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/events?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/events");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <p className="mb-4 text-center font-serif text-lg italic text-cream/80 sm:text-xl">
        What are you looking for tonight?
      </p>
      <div className="flex">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={'Try "comedy in the Village"...'}
          className="flex-1 border border-cream/20 bg-ink/60 px-4 py-3 font-serif text-sm italic text-cream placeholder:text-cream/30 focus:border-lime/50 focus:outline-none sm:px-5 sm:text-base"
        />
        <button
          type="submit"
          className="bg-lime px-6 py-3 text-xs font-semibold tracking-widest text-ink uppercase transition-colors hover:bg-lime-hover sm:px-8 sm:text-sm"
        >
          Search
        </button>
      </div>
    </form>
  );
}
