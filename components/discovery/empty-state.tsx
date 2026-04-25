import { FishOff } from "lucide-react";

export function EmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-[1.6rem] border border-dashed border-ink/12 ${
        compact ? "bg-white/8 p-4 text-white" : "bg-white p-8 text-ink"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            compact ? "bg-white/12" : "bg-mist/80"
          }`}
        >
          <FishOff className={`h-5 w-5 ${compact ? "text-white/72" : "text-glacier"}`} />
        </div>
        <div>
          <p className="text-sm font-semibold">Engir veiðistaðir passa við þessar síur.</p>
          <p className={`mt-1 text-sm ${compact ? "text-white/70" : "text-ink/68"}`}>
            Hreinsaðu eina eða fleiri síur til að sjá fleiri staði á kortinu og í niðurstöðum.
          </p>
        </div>
      </div>
    </div>
  );
}
