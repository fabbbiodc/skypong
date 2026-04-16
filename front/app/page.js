"use client";

import { useTranslation } from "./hooks/use-translation";
import { Navbar, Footer, Hero, LanguageSelector } from "./ui/base";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="h-dvh bg-transparent text-slate-900 lg:px-10 flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <div className="w-[90%] max-w-full bg-white rounded-[2.5rem] shadow-md p-8 sm:p-10 md:p-12 lg:w-[50%] lg:h-[70%] lg:flex-none lg:p-14">
          <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 py-4 md:gap-8 md:py-6 lg:gap-10 lg:py-10">
            <div className="w-full max-w-4xl">
              <Hero titleSize="lg" iconSize="lg" />
            </div>
            <LanguageSelector />
          </section>
        </div>
      </div>
      <div className="mt-auto pb-4">
        <Footer />
      </div>
    </main>
  );
}
