'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameScreen from '../ui/game-front/GameScreen';
import { decodeGameConfig } from '../lib/game/launch-config';
import { useTranslation } from '../hooks/use-translation';

/** Final gameplay route that renders the game canvas with verified configuration. */
export default function CanvasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const config = useMemo(() => {
    const encoded = searchParams.get('config') ?? '';
    try {
      return decodeGameConfig(encoded);
    } catch {
      return null;
    }
  }, [searchParams]);

  if (!config) {
    return (
      <section>
        <p>{t?.game?.errors.invalidConfiguration}</p>
        <button type="button" onClick={() => router.replace('/play?error=invalid-config')}>
          {t?.common?.back || "Back"}
        </button>
      </section>
    );
  }

  return <GameScreen config={config} onExit={() => router.replace('/play')} />;
}
