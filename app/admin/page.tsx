import { Database, ShieldEllipsis, Workflow } from "lucide-react";

const cards = [
  {
    title: "Innlestur heimilda",
    body: "Tengingar sem síðar geta sótt gögn frá leyfissölum, listum Veiðikortsins og ritstýrðum gagnagjöfum.",
    icon: Database,
  },
  {
    title: "Ritstýring og yfirferð",
    body: "Létt vinnulag fyrir lýsingar, merki, myndefni, reglur og tengsl á milli staða.",
    icon: Workflow,
  },
  {
    title: "Traust og rekjanleiki",
    body: "Útgáfustýrð heimildagögn, tímasetningar og merkingar um áreiðanleika þegar raunverulegar samþættingar bætast við.",
    icon: ShieldEllipsis,
  },
];

export default function AdminPlaceholderPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-moss/70">
          Vinnusvæði síðar
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Gagnainnlestur og ritstýring munu búa hér síðar.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/72 sm:text-base">
          MVP útgáfan er vísvitandi framenda-miđuð. Þessi staðgengilssíða sýnir hvar innri verkfæri geta þróast þegar leitaupplifunin og heimildalíkanið hafa verið staðfest.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map(({ title, body, icon: Icon }) => (
          <article
            key={title}
            className="rounded-[1.75rem] border border-white/60 bg-white/70 p-6 shadow-panel backdrop-blur"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand/80 text-ink">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/72">{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
