'use client';

import { useTranslation } from '../hooks/use-translation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import NavigationAppUI from '../ui/navigation-app-ui';
import FooterTermsPolicy from '../ui/footer-terms-policy';

export default function PlayPage()
{
    const { t } = useTranslation();
  return (
    <>
        <main className="h-dvh bg-page-bg flex flex-col">
            <NavigationAppUI />
            <div className="flex flex-1 items-center justify-center">
                <div className="page-content-container">
                    <div className="content-container-md">
                        <h1 className="text-lg md:text-xl">{t.gameMode.title}</h1>
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