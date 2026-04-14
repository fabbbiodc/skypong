'use client';

import Link from 'next/link';
import { useTranslation } from '../hooks/use-translation';
import { useEffect, useState } from 'react';
import NavigationAppUI from '../ui/navigation-app-ui';
import FooterTermsPolicy from '../ui/footer-terms-policy';

export default function PrivacyPage()
{
    const [backlink, setBacklink] = useState('');
    const { t } = useTranslation();

  useEffect(() => {
    // Solo se puede acceder a document en el cliente
    setBacklink(document.referrer);
  }, []);
  return (
    <>
        <main className="h-dvh bg-page-bg flex flex-col">
            <NavigationAppUI />
            <div className="flex flex-1 items-center justify-center">
                <div className="page-content-container">
                    <div className="content-container-lg">
                        <h1 className="text-3xl font-bold mb-4">{t.legal.privacyPage.title}</h1>
                        <div
                            className="scrollable-content bg-content-light legal-content"
                            dangerouslySetInnerHTML={{ __html: t.legal.privacyPage.content }}
                        />
                        <div className="mt-4">
                            <Link href={backlink || '/'} className="link-primary">{ t.navigation.goBack }</Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-auto pb-4">
                <FooterTermsPolicy />
            </div>
        </main>
    </>
  );
}