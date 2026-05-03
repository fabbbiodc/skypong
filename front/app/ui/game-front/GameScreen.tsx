"use client";

import { useMemo, useEffect, useRef } from "react";
import { useTranslation } from "../../hooks/use-translation";
import type { GameConfig } from "../../lib/game/launch-config";
import {
  encodeEngineLaunchConfig,
  toEngineLaunchConfig,
} from "../../lib/game/engine-launch-config";

type Props = {
  config: GameConfig;
  onExit: () => void;
};

/** Gameplay screen that forwards launch configuration to the game engine app. */
export default function GameScreen({ config, onExit }: Props) {
  const { t } = useTranslation();
  const exitLabel = t?.game?.quit ?? "Quit";
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const GAME_CLIENT_URL = process.env.NEXT_PUBLIC_GAME_CLIENT_URL || "http://localhost:5173";

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "game-exit") {
        onExit();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onExit]);

  const launchUrl = useMemo(() => {
    const engineConfig = toEngineLaunchConfig(config, {
      player1: t?.game?.player(1) || "Player 1",
      player2: t?.game?.player(2) || "Player 2",
    });
    const encoded = encodeEngineLaunchConfig(engineConfig);
    return `${GAME_CLIENT_URL}/canvas?config=${encodeURIComponent(encoded)}`;
  }, [config, t, GAME_CLIENT_URL]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950">
      <iframe
        ref={iframeRef}
        src={launchUrl}
        title="Game"
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}
