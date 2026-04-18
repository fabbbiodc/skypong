"use client";

import Link from "next/link";
import { useTranslation } from "../hooks/use-translation";
import { useEffect, useState } from "react";
import { Navbar, Footer } from "../ui/base";
import { PageContainer, ContentContainer, LegalContent } from "../ui/patterns";

export default function PrivacyPage() {
  const [backlink, setBacklink] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    // Solo se puede acceder a document en el cliente
    setBacklink(document.referrer);
  }, []);
  return (
    <>
      <main className="h-dvh bg-page-bg flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <PageContainer>
            <ContentContainer size="lg">
              <h1 className="text-3xl font-bold mb-4">
                {t.legal.privacyPage.title}
              </h1>
              <LegalContent html={t.legal.privacyPage.content} />
              <div className="mt-4">
                <Link href={backlink || "/"} className="text-primary hover:text-primary-hover transition-colors duration-200">
                  {t.navigation.goBack}
                </Link>
              </div>
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
