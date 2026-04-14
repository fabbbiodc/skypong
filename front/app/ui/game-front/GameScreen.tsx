'use client';

import { useMemo } from 'react';
import { useTranslation } from '../../hooks/use-translation';
import type { GameConfig } from '../../lib/game/launch-config';
import { encodeEngineLaunchConfig, toEngineLaunchConfig } from '../../lib/game/engine-launch-config';

type Props = {
  config: GameConfig;
  onExit: () => void;
};

/** Gameplay screen that forwards launch configuration to the game engine app. */
export default function GameScreen({ config, onExit }: Props) {
  const { t } = useTranslation();
  const exitLabel = t?.game?.quit ?? 'Quit';

  const launchUrl = useMemo(() => {
    const engineConfig = toEngineLaunchConfig(config);
    const encoded = encodeEngineLaunchConfig(engineConfig);
    return `/canvas?config=${encodeURIComponent(encoded)}`;
  }, [config]);

  return (
    <section className="game-screen">
      <h2>{t?.game?.playButton ?? 'Play'}</h2>

      <iframe
        title="Game Engine"
        src={launchUrl}
        style={{ width: '100%', minHeight: '70vh', border: 'none', borderRadius: '12px' }}
      />

      <button type="button" onClick={onExit}>
        {exitLabel}
      </button>
    </section>
  );
}
