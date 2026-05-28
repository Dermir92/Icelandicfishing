"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/discover?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/discover");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-xl">
      <div className="flex w-full items-center gap-2 rounded-full border border-white/25 bg-white/12 px-2 py-2 backdrop-blur-sm">
        <Search className="ml-2 h-4 w-4 shrink-0 text-white/60" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Leita að veiðistað..."
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
  );
}
