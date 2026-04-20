"use client";

import { useTranslation } from "./hooks/use-translation";
import { Navbar, Footer, Hero, LanguageSelector } from "./ui/base";
import { homepage, responsiveSpacing } from "./lib/design-tokens";
import { cn } from "./lib/utils";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <main className={cn(homepage.mainContainer.height, homepage.mainContainer.background, homepage.mainContainer.textColor, homepage.mainContainer.padding, homepage.mainContainer.layout)}>
      <Navbar />
      <div className={homepage.contentCard.layout}>
        <div className={cn(homepage.contentCard.width.mobile, homepage.contentCard.maxWidth, homepage.contentCard.background, homepage.contentCard.radius, homepage.contentCard.shadow, homepage.contentCard.padding.base, homepage.contentCard.height.mobile, homepage.contentCard.padding.large, homepage.contentCard.width.desktop, homepage.contentCard.height.desktop)}>
          <section className={cn(homepage.heroSection.layout, homepage.heroSection.spacing.mobile, homepage.heroSection.spacing.tablet, homepage.heroSection.spacing.desktop)}>
            <div className={homepage.contentCard.wrapper}>
              <Hero titleSize="lg" ballSize="lg" />
            </div>
            <LanguageSelector className="mt-8" />
          </section>
        </div>
      </div>
      <div className={homepage.footer.position}>
        <Footer />
      </div>
    </main>
  );
}
