"use client";

import { Button } from "./ui/base/Button";
import { useTranslation } from "./hooks/use-translation";
import FooterTermsPolicy from "./ui/footer-terms-policy";
import HeroUI from "./ui/hero-ui";
import NavigationAppUI from "./ui/navigation-app-ui";
import NavigationLanguageUI from "./ui/navigation-language-ui";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <main className={`h-dvh bg-page-bg text-slate-900 lg:px-10 flex flex-col`}>
      <NavigationAppUI />
      <div className="flex flex-1 items-center justify-center">
        <div className="page-content-container">
          <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 py-4 md:gap-8 md:py-6 lg:gap-10 lg:py-10">
            <div className="w-full max-w-4xl p-6 sm:p-8 md:p-10">
              <HeroUI />
            </div>
            <div>
              <NavigationLanguageUI />
            </div>
          </section>
        </div>
      </div>
      <div className="mt-auto pb-4">
        <FooterTermsPolicy />
      </div>
    </main>
  );
}
