import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { encodeConfig } from "../../utils/configDecoder";
import { GameSessionConfig } from "../../types/GameSessionConfig";

type GameMode = "ai-easy" | "ai-medium" | "ai-hard" | "2p-local";

const PLAYER_COLORS = [
  { hex: "#F6511D", name: "Red-Orange" },
  { hex: "#00A6ED", name: "Cyan Blue" },
  { hex: "#B084CC", name: "Purple" },
  { hex: "#6B8F71", name: "Sage Green" },
  { hex: "#F4E04D", name: "Yellow" },
];

const StartPage = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [player1Color, setPlayer1Color] = useState("#00A6ED");
  const [player2Color, setPlayer2Color] = useState("#F6511D");
  const [scoreToWin, setScoreToWin] = useState(5);

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
  };

  const handleBackToMenu = () => {
    setSelectedMode(null);
    setPlayer1Name("");
    setPlayer2Name("");
    setPlayer1Color("#00A6ED");
    setPlayer2Color("#F6511D");
    setScoreToWin(5);
  };

  const handleStartGame = () => {
    if (!selectedMode) return;
    const p1Name = player1Name.trim() || "Player 1";
    const p2Name =
      selectedMode === "2p-local" ? player2Name.trim() || "Player 2" : "AI";

    const gameMode =
      selectedMode === "2p-local"
        ? "local-2p"
        : (selectedMode as GameSessionConfig["gameMode"]);

    const config: GameSessionConfig = {
      playerName: p1Name,
      playerColor: player1Color,
      gameMode: gameMode,
      winningScore: scoreToWin,
      player2Name: p2Name,
    };

    if (selectedMode === "2p-local") {
      config.player2Color = player2Color;
    }

    const encoded = encodeConfig(config);
    navigate(`/canvas?config=${encoded}`);
  };

  const isAiMode = selectedMode?.startsWith("ai-");
  const isLocal2P = selectedMode === "2p-local";

  if (!selectedMode) {
    return (
      <div style={STYLES.container}>
        <h1 style={STYLES.mainTitle}>SkyPong</h1>
        <div style={STYLES.formContainer}>
          <p style={STYLES.label}>Select Game Mode</p>
          <button
            onClick={() => handleModeSelect("ai-easy")}
            style={{ ...STYLES.button, backgroundColor: "#4CAF50" }}
          >
            vs AI (Easy)
          </button>
          <button
            onClick={() => handleModeSelect("ai-medium")}
            style={{ ...STYLES.button, backgroundColor: "#FF9800" }}
          >
            vs AI (Medium)
          </button>
          <button
            onClick={() => handleModeSelect("ai-hard")}
            style={{ ...STYLES.button, backgroundColor: "#F44336" }}
          >
            vs AI (Hard)
          </button>
          <button
            onClick={() => handleModeSelect("2p-local")}
            style={{ ...STYLES.button, backgroundColor: "#9C27B0" }}
          >
            Local 2 Players
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={STYLES.container}>
      <h1 style={STYLES.title}>
        {isLocal2P ? "Local 2P" : "vs AI"} - Setup
      </h1>
      <div style={STYLES.formContainer}>
        <div style={{ width: "100%" }}>
          <label style={STYLES.label}>Player 1 Name</label>
          <input
            type="text"
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            placeholder="Player 1"
            maxLength={20}
            style={STYLES.input}
          />
        </div>

        <div style={{ width: "100%" }}>
          <label style={STYLES.label}>Player 1 Color</label>
          <div style={STYLES.colorPicker}>
            {PLAYER_COLORS.map((color) => (
              <button
                key={color.hex}
                onClick={() => setPlayer1Color(color.hex)}
                title={color.name}
                style={{
                  ...STYLES.colorButton(player1Color === color.hex),
                  backgroundColor: color.hex,
                }}
              />
            ))}
          </div>
        </div>

        {isLocal2P && (
          <>
            <div style={{ width: "100%" }}>
              <label style={STYLES.label}>Player 2 Name</label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Player 2"
                maxLength={20}
                style={STYLES.input}
              />
            </div>

            <div style={{ width: "100%" }}>
              <label style={STYLES.label}>Player 2 Color</label>
              <div style={STYLES.colorPicker}>
                {PLAYER_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setPlayer2Color(color.hex)}
                    title={color.name}
                    style={{
                      ...STYLES.colorButton(player2Color === color.hex),
                      backgroundColor: color.hex,
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ width: "100%" }}>
          <label style={STYLES.label}>Score to Win</label>
          <select
            value={scoreToWin}
            onChange={(e) => setScoreToWin(Number(e.target.value))}
            style={STYLES.input}
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={7}>7</option>
            <option value={9}>9</option>
            <option value={11}>11</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
            width: "100%",
          }}
        >
          <button onClick={handleBackToMenu} style={STYLES.backButton}>
            Back
          </button>
          <button
            onClick={handleStartGame}
            style={{ ...STYLES.button, backgroundColor: "#4CAF50", flex: 1 }}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

const STYLES = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#1a1a2e",
    gap: "20px",
  },
  title: {
    color: "white",
    marginBottom: "30px",
    fontSize: "48px",
    fontWeight: "bold" as const,
    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
  },
  mainTitle: {
    color: "white",
    fontSize: "48px",
    fontWeight: "bold" as const,
    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
  },
  label: {
    display: "block",
    color: "#aaa",
    marginBottom: "8px",
    fontSize: "16px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "18px",
    backgroundColor: "#2d2d44",
    border: "2px solid #444",
    borderRadius: "8px",
    color: "white",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  button: {
    padding: "15px 40px",
    fontSize: "20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold" as const,
    minWidth: "200px",
    transition: "transform 0.1s, box-shadow 0.1s",
  },
  backButton: {
    flex: 1,
    padding: "15px 20px",
    fontSize: "16px",
    backgroundColor: "#666",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold" as const,
  },
  colorPicker: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    padding: "10px",
    backgroundColor: "#2d2d44",
    borderRadius: "8px",
    border: "2px solid #444",
  },
  colorButton: (isSelected: boolean) => ({
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: isSelected ? "3px solid white" : "3px solid transparent",
    cursor: "pointer",
    boxShadow: isSelected
      ? "0 0 10px rgba(255,255,255,0.5)"
      : "none",
    transition: "all 0.2s",
    transform: isSelected ? "scale(1.1)" : "scale(1)",
  }),
  formContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
    alignItems: "center",
    width: "300px",
  },
};

export default StartPage;
