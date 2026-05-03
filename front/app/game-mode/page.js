"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../hooks/use-translation";
import { Navbar, Footer, Button } from "../ui/base";
import { PageContainer, ContentContainer } from "../ui/patterns";
import { mainContainers } from "../lib/design-tokens";
import { encodeGameConfig } from "../lib/game/launch-config";
import Link from "next/link";

const GAME_MODES = [
  {
    id: "LOCAL",
    title: "Local 2 Player",
    description: "Play against another player on the same keyboard",
    icon: "👥",
  },
  {
    id: "AI",
    title: "Play vs AI",
    description: "Play against an AI opponent",
    icon: "🤖",
    difficulties: [
      { id: "EASY", label: "Easy" },
      { id: "MEDIUM", label: "Medium" },
      { id: "HARD", label: "Hard" },
    ],
  },
];

export default function GameModePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [pointsToWin, setPointsToWin] = useState(5);
  const [ballColor, setBallColor] = useState("#00A6ED");

  const handleModeSelect = (modeId) => {
    setSelectedMode(modeId);
    if (modeId === "AI") {
      // For AI mode, need to select difficulty first
      setShowConfig(false);
    } else {
      // For Local 2P, go straight to config
      setSelectedDifficulty(null);
      setShowConfig(true);
    }
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setShowConfig(true);
  };

  const handleStartGame = () => {
    if (!selectedMode) {
      return;
    }

    const config = {
      mode: selectedMode,
      ...(selectedDifficulty && { difficulty: selectedDifficulty }),
      pointsToWin: parseInt(pointsToWin),
      ballColor: ballColor,
    };

    try {
      const encoded = encodeGameConfig(config);
      router.push(`/launch?config=${encodeURIComponent(encoded)}`);
    } catch (error) {
      console.error("Failed to encode config:", error);
    }
  };

  const handleBack = () => {
    if (showConfig && selectedMode === "AI") {
      // Go back to difficulty selection
      setSelectedDifficulty(null);
      setShowConfig(false);
    } else {
      // Go back to mode selection
      setSelectedMode(null);
      setSelectedDifficulty(null);
      setShowConfig(false);
    }
  };

  // Difficulty selection for AI mode
  if (selectedMode === "AI" && !showConfig) {
    const aiMode = GAME_MODES.find((m) => m.id === "AI");
    return (
      <main className={mainContainers.centeredLayout.wrapper}>
        <Navbar />
        <div className={mainContainers.centeredLayout.contentArea}>
          <PageContainer>
            <ContentContainer size="md">
              <div className="space-y-8">
                <div>
                  <h1 className="text-xl font-bold mb-2">{aiMode.title}</h1>
                  <p className="text-sm text-slate-400">Select difficulty level</p>
                </div>

                <div className="space-y-3">
                  {aiMode.difficulties.map((diff) => (
                    <button
                      key={diff.id}
                      onClick={() => handleDifficultySelect(diff.id)}
                      className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-cyan-500 transition-all text-left font-medium"
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleBack} variant="secondary" className="flex-1">
                    Back
                  </Button>
                </div>
              </div>
            </ContentContainer>
          </PageContainer>
        </div>
        <div className={mainContainers.centeredLayout.footer}>
          <Footer />
        </div>
      </main>
    );
  }

  // Configuration screen
  if (showConfig && selectedMode) {
    const mode = GAME_MODES.find((m) => m.id === selectedMode);
    return (
      <main className={mainContainers.centeredLayout.wrapper}>
        <Navbar />
        <div className={mainContainers.centeredLayout.contentArea}>
          <PageContainer>
            <ContentContainer size="md">
              <div className="space-y-8">
                <div>
                  <h1 className="text-xl font-bold mb-2">{mode.title}</h1>
                  <p className="text-sm text-slate-400">{mode.description}</p>
                  {selectedDifficulty && (
                    <p className="text-sm text-cyan-400 mt-2">
                      Difficulty: {GAME_MODES.find((m) => m.id === "AI")?.difficulties?.find((d) => d.id === selectedDifficulty)?.label}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Winning Score
                    </label>
                    <select
                      value={pointsToWin}
                      onChange={(e) => setPointsToWin(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="3">3 Points</option>
                      <option value="5">5 Points</option>
                      <option value="7">7 Points</option>
                      <option value="9">9 Points</option>
                      <option value="11">11 Points</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Ball Color
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={ballColor}
                        onChange={(e) => setBallColor(e.target.value)}
                        className="w-16 h-10 rounded-lg border border-slate-700 cursor-pointer"
                      />
                      <span className="text-sm text-slate-400">{ballColor}</span>
                    </div>
                  </div>

                  {selectedMode === "LOCAL" && (
                    <div className="p-4 bg-slate-800/50 rounded-lg text-sm text-slate-300">
                      <p className="font-semibold mb-2">Controls:</p>
                      <p>
                        <strong>Player 1:</strong> W/S keys (or A/D)
                      </p>
                      <p className="mt-2">
                        <strong>Player 2:</strong> Arrow Keys Up/Down
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleBack} variant="secondary" className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleStartGame} variant="primary" className="flex-1">
                    Start Game
                  </Button>
                </div>
              </div>
            </ContentContainer>
          </PageContainer>
        </div>
        <div className={mainContainers.centeredLayout.footer}>
          <Footer />
        </div>
      </main>
    );
  }

  // Mode selection screen
  return (
    <main className={mainContainers.centeredLayout.wrapper}>
      <Navbar />
      <div className={mainContainers.centeredLayout.contentArea}>
        <PageContainer>
          <ContentContainer size="md">
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold">Select Game Mode</h1>
                <p className="text-sm text-slate-400 mt-2">
                  Choose how you want to play
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {GAME_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleModeSelect(mode.id)}
                    className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-cyan-500 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{mode.icon}</div>
                      <div className="flex-1">
                        <h2 className="font-bold group-hover:text-cyan-400 transition-colors">
                          {mode.title}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                          {mode.description}
                        </p>
                      </div>
                      <div className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <Link href="/" className="inline-block">
                  <Button variant="secondary">Back to Home</Button>
                </Link>
              </div>
            </div>
          </ContentContainer>
        </PageContainer>
      </div>
      <div className={mainContainers.centeredLayout.footer}>
        <Footer />
      </div>
    </main>
  );
}
