"use client";

import { useTranslation } from "../hooks/use-translation";
import { Navbar, Footer } from "../ui/base";
import { PageContainer, ContentContainer } from "../ui/patterns";
import { mainContainers } from "../lib/design-tokens";

export default function PlayPage() {
  const { t } = useTranslation();
  return (
    <>
      <main className={mainContainers.centeredLayout.wrapper}>
        <Navbar />
        <div className={mainContainers.centeredLayout.contentArea}>
          <PageContainer>
            <ContentContainer size="md">
              <h1 className="text-lg md:text-xl">{t.gameMode.title}</h1>
            </ContentContainer>
          </PageContainer>
        </div>
        <div className={mainContainers.centeredLayout.footer}>
          <Footer />
        </div>
      </main>
    </>
  );
}
