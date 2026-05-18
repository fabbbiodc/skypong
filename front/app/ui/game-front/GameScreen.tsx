"use client";

import { useMemo, useEffect, useRef, useState } from "react";
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
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const GAME_CLIENT_URL = process.env.NEXT_PUBLIC_GAME_CLIENT_URL;

  const gameSrc = useMemo(() => {
    if (GAME_CLIENT_URL) {
      return GAME_CLIENT_URL;
    }
    if (!basePath) {
      return "http://localhost:5173/#/canvas?config=" + encodeURIComponent(
        encodeEngineLaunchConfig(
          toEngineLaunchConfig(config, {
            player1: t?.game?.player(1) || "Player 1",
            player2: t?.game?.player(2) || "Player 2",
          })
        )
      );
    }
    const engineConfig = toEngineLaunchConfig(config, {
      player1: t?.game?.player(1) || "Player 1",
      player2: t?.game?.player(2) || "Player 2",
    });
    const encoded = encodeEngineLaunchConfig(engineConfig);
    return `${basePath}/game/#/canvas?config=${encodeURIComponent(encoded)}`;
  }, [config, t, GAME_CLIENT_URL, basePath]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "game-exit") {
        onExit();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950">
      {!iframeLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ textAlign: "center", width: "100%", maxWidth: 320, padding: "0 24px" }}>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: 3,
                color: "#475569",
                fontFamily: "'Space Grotesk', sans-serif",
                marginBottom: 12,
                textTransform: "uppercase",
              }}
            >
              SkyPong
            </div>
            <div
              style={{
                fontSize: 16,
                color: "#94a3b8",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 400,
                marginBottom: 20,
              }}
            >
              Loading game...
            </div>
            <div
              style={{
                width: "100%",
                height: 4,
                background: "#e2e8f0",
                borderRadius: 2,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: "30%",
                  height: "100%",
                  background: "#475569",
                  borderRadius: 2,
                  animation: "loadingPulse 1.5s ease-in-out infinite",
                }}
              />
            </div>
          </div>
          <style>{`
            @keyframes loadingPulse {
              0%, 100% { width: 10%; opacity: 0.4; }
              50% { width: 60%; opacity: 1; }
            }
          `}</style>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={gameSrc}
        title="Game"
        className="h-full w-full border-0"
        style={{ height: "100dvh" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; webgl"
        onLoad={() => setIframeLoaded(true)}
      />
    </div>
  );
}
