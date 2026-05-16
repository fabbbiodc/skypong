"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../hooks/use-translation";
import { useMediaQuery } from "../hooks/use-media-query";
import { Navbar, Footer, Button } from "../ui/base";
import { PageContainer, ContentContainer } from "../ui/patterns";
import { mainContainers } from "../lib/design-tokens";
import { encodeGameConfig } from "../lib/game/launch-config";

const PLAYER_COLORS = [
  { hex: "#F6511D", name: "Red-Orange" },
  { hex: "#00A6ED", name: "Cyan Blue" },
  { hex: "#B084CC", name: "Purple" },
  { hex: "#6B8F71", name: "Sage Green" },
  { hex: "#F4E04D", name: "Yellow" },
];

function ColorPicker({ selectedColor, onColorSelect, label }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </label>
      <div className="flex flex-wrap gap-3">
        {PLAYER_COLORS.map((color) => (
          <button
            key={color.hex}
            type="button"
            onClick={() => onColorSelect(color.hex)}
            title={color.name}
            className="h-10 w-10 rounded-full border-2 transition-all hover:scale-110"
            style={{
              backgroundColor: color.hex,
              borderColor: selectedColor === color.hex ? "#0f172a" : "transparent",
              boxShadow: selectedColor === color.hex ? `0 0 0 3px ${color.hex}80` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function GameModePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [pointsToWin, setPointsToWin] = useState(5);
  const [player1Color, setPlayer1Color] = useState("#00A6ED");
  const [player2Color, setPlayer2Color] = useState("#F6511D");
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");

  useEffect(() => {
    if (isMobile && selectedMode === null) {
      setSelectedMode("AI");
    }
  }, [isMobile, selectedMode]);

  const gm = t?.gameMode || {};

  const gameModes = [
    {
      id: "LOCAL",
      title: gm.local2P || "Local 2P",
      description: gm.local2PDesc || "Play against another player on the same keyboard",
      icon: "👥",
    },
    {
      id: "AI",
      title: gm.vsAI || "vs AI",
      description: gm.vsAIDesc || "Challenge the computer",
      icon: "🤖",
      difficulties: [
        { id: "EASY", label: gm.easy || "Easy" },
        { id: "MEDIUM", label: gm.medium || "Medium" },
        { id: "HARD", label: gm.hard || "Hard" },
      ],
    },
  ];

  const handleModeSelect = (modeId) => {
    setSelectedMode(modeId);
    if (modeId === "AI") {
      setShowConfig(false);
    } else {
      setSelectedDifficulty(null);
      setShowConfig(true);
    }
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setShowConfig(true);
  };

  const handleStartGame = () => {
    if (!selectedMode) return;

    const player1 = player1Name.trim() || "P1";
    const player2 = player2Name.trim() || "P2";

    const config = {
      mode: selectedMode,
      ...(selectedDifficulty && { difficulty: selectedDifficulty }),
      pointsToWin: parseInt(pointsToWin),
      player1Color: player1Color,
      player2Color: player2Color,
      player1Name: player1,
      player2Name: player2,
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
      setSelectedDifficulty(null);
      setShowConfig(false);
    } else {
      setSelectedMode(null);
      setSelectedDifficulty(null);
      setShowConfig(false);
    }
  };

  if (selectedMode === "AI" && !showConfig) {
    return (
      <main className={mainContainers.centeredLayout.wrapper}>
        <Navbar />
        <div className={mainContainers.centeredLayout.contentArea}>
          <PageContainer>
            <ContentContainer size="md">
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-xl font-bold mb-2">{gameModes[1].title}</h1>
                  <p className="text-sm text-slate-400">{gm.selectDifficulty || "Select difficulty level"}</p>
                </div>

                <div className="flex flex-col gap-3">
                  {gameModes[1].difficulties.map((diff) => (
                    <button
                      key={diff.id}
                      onClick={() => handleDifficultySelect(diff.id)}
                      className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-cyan-500 transition-all text-left font-medium"
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>

                <Button onClick={handleBack} variant="secondary" className="w-full">
                  {gm.back || "Back"}
                </Button>
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

  if (showConfig && selectedMode) {
    const mode = gameModes.find((m) => m.id === selectedMode);
    return (
      <main className={mainContainers.centeredLayout.wrapper}>
        <Navbar />
        <div className={mainContainers.centeredLayout.contentArea}>
          <PageContainer>
            <ContentContainer size="md">
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-xl font-bold mb-2">{mode?.title}</h1>
                  <p className="text-sm text-slate-400">{mode?.description}</p>
                  {selectedDifficulty && (
                    <p className="text-sm text-cyan-400 mt-2">
                      {selectedDifficulty}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-6">
                  {selectedMode === "LOCAL" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          {gm.player1Name || "Player 1 Name"}
                        </label>
                        <input
                          type="text"
                          value={player1Name}
                          onChange={(e) => setPlayer1Name(e.target.value)}
                          placeholder="P1"
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          {gm.player2Name || "Player 2 Name"}
                        </label>
                        <input
                          type="text"
                          value={player2Name}
                          onChange={(e) => setPlayer2Name(e.target.value)}
                          placeholder="P2"
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </>
                  )}

                  {selectedMode === "AI" && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        {gm.yourName || "Your Name"}
                      </label>
                      <input
                        type="text"
                        value={player1Name}
                        onChange={(e) => setPlayer1Name(e.target.value)}
                        placeholder="Player"
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {gm.winningScore || "Winning Score"}
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

                  {selectedMode === "LOCAL" && (
                    <>
                      <ColorPicker
                        label={gm.player1Color || "Player 1 Color"}
                        selectedColor={player1Color}
                        onColorSelect={setPlayer1Color}
                      />
                      <ColorPicker
                        label={gm.player2Color || "Player 2 Color"}
                        selectedColor={player2Color}
                        onColorSelect={setPlayer2Color}
                      />
                    </>
                  )}

                  {selectedMode === "AI" && (
                    <ColorPicker
                      label={gm.yourPaddleColor || "Your Paddle Color"}
                      selectedColor={player1Color}
                      onColorSelect={setPlayer1Color}
                    />
                  )}

                  <div className="p-4 bg-slate-800/50 rounded-lg text-sm text-slate-300">
                    <p className="font-semibold mb-2">{gm.controls || "Controls:"}</p>
                    {selectedMode === "LOCAL" ? (
                      <>
                        <p>{gm.p1Controls || "P1: A/D keys"}</p>
                        <p>{gm.p2Controls || "P2: J/L keys"}</p>
                      </>
                    ) : (
                      <p>{gm.yourControls || "You: A/D keys"}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleBack} variant="secondary" className="flex-1">
                    {gm.back || "Back"}
                  </Button>
                  <Button onClick={handleStartGame} variant="primary" className="flex-1">
                    {gm.start || "Start"}
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

  if (selectedMode === null && !isMobile) {
    return (
      <main className={mainContainers.centeredLayout.wrapper}>
        <Navbar />
        <div className={mainContainers.centeredLayout.contentArea}>
          <PageContainer>
            <ContentContainer size="md">
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-2xl font-bold">{gm.selectGameMode || "Select Game Mode"}</h1>
                  <p className="text-sm text-slate-400 mt-2">{gm.chooseHowToPlay || "Choose how you want to play"}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {gameModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleModeSelect(mode.id)}
                      className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-cyan-500 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{mode.icon}</div>
                        <div className="flex-1">
                          <h2 className="font-bold group-hover:text-cyan-400 transition-colors">
                            {mode.title}
                          </h2>
                          <p className="text-sm text-slate-400">{mode.description}</p>
                        </div>
                        <div className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </div>
                      </div>
                    </button>
                  ))}
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

  return null;
}
