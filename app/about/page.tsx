import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-moss/70">
          Um okkur
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Að uppgötva veiðistaði á Íslandi ætti ekki að vera flókið.
        </h1>
        <div className="mt-5 max-w-2xl space-y-4 text-[15px] leading-7 text-ink/72">
          <p>
            Í dag eru upplýsingar oft dreifðar á milli leyfissíðna, veiðifélaga, ferðavefja og ólíkra heimilda, sem gerir samanburð og skipulag erfitt.
          </p>
          <p>
            Markmiðið hér er að einfalda þetta ferli: eitt kort, skýrar síur og aðgengilegar upplýsingasíður sem hjálpa þér að finna rétta staðinn, hvort sem þú ert að leita að laxveiði, silungi, fjölskylduvænum stað eða næsta ævintýri.
          </p>
          <p>
            Ef þið vitið um veiðistaði sem eru ekki á skrá hjá okkur, endilega{" "}
            <a href="mailto:foxel@foxel.is" className="font-medium text-ink underline underline-offset-2 hover:text-moss">
              hafið samband
            </a>
            .
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-moss/70">Ábyrgðaraðili</p>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Persónuvernd og kökur</h2>
        <div className="mt-4 max-w-2xl space-y-3 text-sm leading-7 text-ink/70">
          <p>
            Þessi vefur er rekinn af <strong className="text-ink">Foxel</strong>. Við söfnum ekki persónugreinanlegum gögnum beint, en við notum þriðja aðila þjónustu (Mapbox) til að birta kort — þessi þjónusta kann að skrá IP-föng og nota kökur.
          </p>
          <p>
            Með því að nota vefinn samþykkir þú notkun þessara þjónustu. Þú getur hafnað kökunum í kökubanner-inum þegar þú heimsækir síðuna.
          </p>
          <p>
            Spurningar um persónuvernd:{" "}
            <a href="mailto:foxel@foxel.is" className="font-medium text-ink underline underline-offset-2 hover:text-moss">
              foxel@foxel.is
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
