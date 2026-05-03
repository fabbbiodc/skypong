"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GameScreen from "../ui/game-front/GameScreen";
import { decodeGameConfig, type GameConfig } from "../lib/game/launch-config";
import { useTranslation } from "../hooks/use-translation";

/** Final gameplay route that renders the game canvas with verified configuration. */
export default function CanvasPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [config, setConfig] = useState<GameConfig | null | undefined>(
    undefined,
  );

  useEffect(() => {
    const encoded =
      new URLSearchParams(window.location.search).get("config") ?? "";

    try {
      setConfig(decodeGameConfig(encoded));
    } catch {
      setConfig(null);
    }
  }, []);

  if (config === undefined) {
    return (
      <section>
        <p>{t?.common?.loading || "Loading..."}</p>
      </section>
    );
  }

  if (!config) {
    return (
      <section>
        <p>{t?.game?.errors.invalidConfiguration}</p>
        <button
          type="button"
          onClick={() => router.replace("/game-mode?error=invalid-config")}
        >
          {t?.common?.back || "Back"}
        </button>
      </section>
    );
  }

  return <GameScreen config={config} onExit={() => router.replace("/game-mode")} />;
}
