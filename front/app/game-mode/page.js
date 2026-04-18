"use client";

import { useTranslation } from "../hooks/use-translation";
import { Navbar, Footer } from "../ui/base";
import { PageContainer, ContentContainer } from "../ui/patterns";

export default function PlayPage() {
  const { t } = useTranslation();
  return (
    <>
      <main className="h-dvh bg-page-bg flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <PageContainer>
            <ContentContainer size="md">
              <h1 className="text-lg md:text-xl">{t.gameMode.title}</h1>
            </ContentContainer>
          </PageContainer>
        </div>
        <div className="mt-auto pb-4">
          <Footer />
        </div>
      </main>
    </>
  );
}
