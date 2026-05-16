"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "./hooks/use-translation";
import { Navbar, Footer, Hero, LanguageSelector } from "./ui/base";
import { homepage, responsiveSpacing } from "./lib/design-tokens";
import { cn } from "./lib/utils";

export default function HomePage() {
  const { t } = useTranslation();
  const [ballReady, setBallReady] = useState(false);
  const [skyReady, setSkyReady] = useState(false);
  const skyReadyRef = useRef(false);

  useEffect(() => {
    const handleSkyReady = () => {
      skyReadyRef.current = true;
      setSkyReady(true);
    };

    window.addEventListener("skybox-ready", handleSkyReady);

    if (typeof window !== "undefined" && window.__SKYBOX_READY__) {
      skyReadyRef.current = true;
      setSkyReady(true);
    }

    return () => window.removeEventListener("skybox-ready", handleSkyReady);
  }, []);

  const handleBallReady = () => {
    setBallReady(true);
  };

  const isReady = ballReady && skyReady;

  return (
    <main className={cn(homepage.mainContainer.height, homepage.mainContainer.background, homepage.mainContainer.textColor, "flex flex-col")}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center pt-8">
        <div className={cn(homepage.contentCard.width.mobile, homepage.contentCard.maxWidth, homepage.contentCard.width.desktop, "flex flex-col items-center", "max-h-[70dvh]")}>
          <Hero titleSize="lg" ballSize="lg" onReady={handleBallReady} />
          <LanguageSelector className="mt-2" />
        </div>
      </div>
      <div className={homepage.footer.position}>
        <Footer />
      </div>
      {!isReady && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            transition: "opacity 0.5s ease-out",
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
              Loading...
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
                  width: "20%",
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
    </main>
  );
}
