import Link from "next/link";
import { Map, MenuSquare } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-fog/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[128rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8 xl:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[1.15rem] bg-[#12343B] text-white shadow-panel">
            <Map className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#0D3550]/70">
              Veiði á Íslandi
            </p>
            <p className="text-base font-semibold tracking-tight text-[#0D3550] sm:text-lg">
              Veiðistaðir
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-[#0D3550]/78 md:flex">
          <Link className="transition hover:text-[#0D3550]" href="/">
            Forsíða
          </Link>
          <Link className="transition hover:text-[#0D3550]" href="/discover">
            Yfirlit
          </Link>
        </nav>

        <Link
          href="/discover"
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#0D3550] shadow-sm transition hover:border-ink/20 hover:bg-mist/55"
        >
          <MenuSquare className="h-4 w-4" />
          Skoða staði
        </Link>
      </div>
    </header>
  );
}
