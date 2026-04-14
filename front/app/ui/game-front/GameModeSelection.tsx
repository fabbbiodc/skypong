'use client';

import { useTranslation } from '../../hooks/use-translation';

type Props = {
  onSelectAI: () => void;
  onSelectMultiplayer: () => void;
  isLogged: boolean;
};

export default function GameModeSelection({ onSelectAI, onSelectMultiplayer, isLogged }: Props) {
  const { t } = useTranslation();

  return (
    <>
    <section className="game-mode-selection">
      <h1>{t?.gameMode?.chooseMode ?? 'Choose your game mode'}</h1>

      <div>
        <button type="button" onClick={onSelectAI}>
          {t?.gameMode?.ai?.title ?? '1 vs AI'}
        </button>
    {/*{ console.log("User is logged: ", isLogged)}*/}
    { isLogged ? (
        <button type="button" onClick={onSelectMultiplayer}>
          {t?.gameMode?.multiplayer || 'Multiplayer'}
        </button>) : ("")
    }
      </div>
    </section>
    </>
  );
}
