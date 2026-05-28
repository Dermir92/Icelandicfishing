"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl">
      <div className="rounded-2xl border border-ink/8 bg-white/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur sm:flex sm:items-center sm:gap-4 sm:p-5">
        <p className="flex-1 text-[13px] leading-6 text-ink/70">
          Þessi vefur notar kökur og þriðja aðila þjónustu (Mapbox) til að birta kort.
          Með því að nota vefinn samþykkir þú notkun þessara kaka.{" "}
          <Link href="/about" className="underline underline-offset-2 hover:text-ink">
            Nánari upplýsingar
          </Link>
          .
        </p>
        <div className="mt-3 flex gap-2 sm:mt-0 sm:shrink-0">
          <button
            type="button"
            onClick={accept}
            className="rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-ink/88"
          >
            Samþykkja
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full border border-ink/12 px-4 py-2 text-[13px] font-semibold text-ink/70 transition hover:bg-ink/4"
          >
            Loka
          </button>
        </div>
      </div>
    </div>
  );
}
