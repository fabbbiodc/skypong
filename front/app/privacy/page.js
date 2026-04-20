"use client";

import Link from "next/link";
import { useTranslation } from "../hooks/use-translation";
import { useEffect, useState } from "react";
import { Navbar, Footer } from "../ui/base";
import { PageContainer, ContentContainer, LegalContent } from "../ui/patterns";
import { mainContainers, legalPages } from "../lib/design-tokens";

export default function PrivacyPage() {
  const [backlink, setBacklink] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    // Solo se puede acceder a document en el cliente
    setBacklink(document.referrer);
  }, []);
  return (
    <>
      <main className={mainContainers.centeredLayout.wrapper}>
        <Navbar />
        <div className={mainContainers.centeredLayout.contentArea}>
          <PageContainer>
            <ContentContainer size="lg">
              <h1 className={legalPages.title}>
                {t.legal.privacyPage.title}
              </h1>
              <LegalContent html={t.legal.privacyPage.content} />
              <div className="mt-4">
                <Link href={backlink || "/"} className={legalPages.link}>
                  {t.navigation.goBack}
                </Link>
              </div>
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
