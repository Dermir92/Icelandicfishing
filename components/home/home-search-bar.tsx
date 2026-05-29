"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Spot = { name: string; slug: string };

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function HomeSearchBar({ spots = [] }: { spots?: Spot[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions =
    query.trim().length > 0
      ? spots
          .filter((s) => normalize(s.name).includes(normalize(query.trim())))
          .slice(0, 6)
      : [];

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      router.push(`/spots/${suggestions[activeIndex].slug}`);
    } else {
      const trimmed = query.trim();
      router.push(trimmed ? `/discover?q=${encodeURIComponent(trimmed)}` : "/discover");
    }
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative mt-8 w-full max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="flex w-full items-center gap-2 rounded-full border border-white/25 bg-white/12 px-2 py-2 backdrop-blur-sm">
          <Search className="ml-2 h-4 w-4 shrink-0 text-white/60" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Leita að veiðistað..."
            autoComplete="off"
            className="flex-1 bg-transparent text-[15px] text-white placeholder-white/50 outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#0D3550] transition hover:bg-white/90"
          >
            Leita
          </button>
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-white/12 bg-[#0D3550] shadow-[0_16px_40px_rgba(5,19,27,0.32)]">
          {suggestions.map((spot, i) => (
            <li key={spot.slug}>
              <button
                type="button"
                onMouseDown={() => {
                  router.push(`/spots/${spot.slug}`);
                  setOpen(false);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
                  i === activeIndex
                    ? "bg-white/12 text-white"
                    : "text-white/85 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Search className="h-3.5 w-3.5 shrink-0 text-white/40" />
                {spot.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
