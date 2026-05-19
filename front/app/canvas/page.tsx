"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GameScreen from "../ui/game-front/GameScreen";
import { decodeGameConfig, type GameConfig } from "../lib/game/launch-config";
import { useTranslation } from "../hooks/use-translation";

/** Final gameplay route that renders the game canvas with verified configuration. */
export default function CanvasPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [config, setConfig] = useState<GameConfig | null | undefined>(
    undefined,
  );

  useEffect(() => {
    const encoded =
      new URLSearchParams(window.location.search).get("config") ?? "";

    try {
      const decoded = decodeGameConfig(encoded);
      setConfig({ ...decoded, language: locale });
    } catch {
      setConfig(null);
    }
  }, [locale]);

  if (config === undefined) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
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
            {t?.common?.loading || "Loading..."}
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
                width: "15%",
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
