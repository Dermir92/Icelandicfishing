import Link from "next/link";
import { ArrowRight, Compass, Layers3, ShieldCheck } from "lucide-react";

const principles = [
  {
    title: "Ákvörðun fyrst, ekki skráning fyrst",
    description:
      "Veiðistaðir er hannað til að svara hvert þú ættir að fara, ekki bara til að sýna að staður sé til.",
    icon: Compass,
  },
  {
    title: "Einn traustur flötur",
    description:
      "Við setjum staðsetningu, fisktegundir, aðgengi, tímabil, verðvísbendingar og heimildir saman á einn stað svo auðveldara sé að bera staði saman.",
    icon: Layers3,
  },
  {
    title: "Byggt fyrir rólegt öryggi",
    description:
      "Upplifunin leggur áherslu á skýrleika, hagnýtar samantektir og gagnsæjar ytri heimildir fremur en óþarfa skraut.",
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-moss/70">
          Um vöruna
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Betri leið til að uppgötva veiðistaði um allt Ísland.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/72 sm:text-base">
          Veiðiupplýsingar á Íslandi eru oft dreifðar á milli leyfissíðna, félagasíðna, ferðavefja og sérhæfðra heimilda. Markmiðið hér er að gera leitina einfaldari: eitt kort, eitt safn af síum og ein skýr upplýsingasíða sem hjálpar þér að ákveða hvort staður henti ferðinni.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {principles.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="rounded-[1.75rem] border border-white/60 bg-white/70 p-6 shadow-panel backdrop-blur"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-glacier/18 text-glacier">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/70">{description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-white/60 bg-[#12343B] p-6 text-white shadow-panel sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/60">
            Aðferð
          </p>
          <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">
            Byrjað á traustum gervigögnum, síðan bætt við raunverulegum heimildum af varfærni.
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-white/78">
            <p>
              MVP útgáfan notar skipulögð gervigögn svo hægt sé að prófa kjarnaupplifunina áður en farið er í skrap, samstarfsaðila eða gagnainnlestur.
            </p>
            <p>
              Gagnalíkanið er vísvitandi mótað fyrir framtíðarheimildir: Veiðikortið, ritstýrðar samantektir, verðvísbendingar, reglur og marga útleiðarhlekkja.
            </p>
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-panel backdrop-blur sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-moss/70">
            Næstu skref
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-ink/74">
            <li>Bæta við vistuðum stöðum og samanburðarham með notandaaðgangi.</li>
            <li>Setja upp gagnainnlestur og ritstýrð vinnuflæði.</li>
            <li>Tengja síðar veður, færð og árstíðabundnar uppfærslur.</li>
          </ul>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            Skoða kortið
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </section>
    </main>
  );
}
