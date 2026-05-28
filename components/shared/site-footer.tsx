export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-white/50 bg-fog/55">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-ink/58 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>© {new Date().getFullYear()} Foxel. Allur réttur áskilinn.</p>
        <p>foxel@foxel.is</p>
      </div>
    </footer>
  );
}
