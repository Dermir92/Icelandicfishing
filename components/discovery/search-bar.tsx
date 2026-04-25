"use client";

import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-[1.2rem] border border-ink/10 bg-white px-4 py-3.5 shadow-[0_10px_24px_rgba(18,40,45,0.04)] transition focus-within:border-[#12343B]/24 focus-within:shadow-[0_14px_28px_rgba(18,40,45,0.06)]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist text-ink/56">
        <Search className="h-4 w-4" />
      </div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Leita eftir stað, landshluta, fisktegund eða leyfi"
        className="w-full border-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink/38"
      />
    </label>
  );
}
