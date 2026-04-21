"use client";

import { useTranslation } from "./hooks/use-translation";
import { Navbar, Footer, Hero, LanguageSelector } from "./ui/base";
import { homepage, responsiveSpacing } from "./lib/design-tokens";
import { cn } from "./lib/utils";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <main className={cn(homepage.mainContainer.height, homepage.mainContainer.background, homepage.mainContainer.textColor, "flex flex-col")}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center pt-8">
        <div className={cn(homepage.contentCard.width.mobile, homepage.contentCard.maxWidth, homepage.contentCard.width.desktop, "flex flex-col items-center", "max-h-[70dvh]")}>
          <Hero titleSize="lg" ballSize="lg" />
          <LanguageSelector className="mt-2" />
        </div>
      </div>
      <div className={homepage.footer.position}>
        <Footer />
      </div>
    </main>
  );
}
