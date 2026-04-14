import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as Colyseus from "colyseus.js";
import { SERVER_CONNECTION } from "../../config";
import { encodeConfig } from "../../utils/configDecoder";
import { GameSessionConfig } from "../../types/GameSessionConfig";

type GameMode = "ai-easy" | "ai-medium" | "ai-hard" | "2p-local" | "2p-online";

interface RoomListing {
  roomId: string;
  metadata: {
    player1Name: string;
    player1Color?: string;
    waitingForOpponent: boolean;
  };
  clients: number;
}

const PLAYER_COLORS = [
  { hex: "#F6511D", name: "Red-Orange" },
  { hex: "#00A6ED", name: "Cyan Blue" },
  { hex: "#B084CC", name: "Purple" },
  { hex: "#6B8F71", name: "Sage Green" },
  { hex: "#F4E04D", name: "Yellow" },
];

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
    fontSize: "36px",
    fontWeight: "bold",
    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
  },
  mainTitle: {
    color: "white",
    marginBottom: "30px",
    fontSize: "48px",
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    boxShadow: isSelected ? "0 0 10px rgba(255,255,255,0.5)" : "none",
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
  roomList: {
    width: "350px",
    maxHeight: "250px",
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  roomItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#2d2d44",
    borderRadius: "8px",
    border: "1px solid #444",
  },
  section: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    alignItems: "center",
  },
  sectionDivider: {
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #444",
  },
};

const GameButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  color: string;
  hoverColor: string;
}> = ({ onClick, children, color, hoverColor }) => (
  <button
    onClick={onClick}
    style={{ ...STYLES.button, backgroundColor: color, color: "white" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.05)";
      e.currentTarget.style.boxShadow = `0 4px 15px ${hoverColor}`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {children}
  </button>
);

const ColorPicker: React.FC<{
  selectedColor: string;
  onColorSelect: (color: string) => void;
  label: string;
}> = ({ selectedColor, onColorSelect, label }) => (
  <div style={{ width: "100%" }}>
    <label style={STYLES.label}>{label}</label>
    <div style={STYLES.colorPicker}>
      {PLAYER_COLORS.map((color) => (
        <button
          key={color.hex}
          onClick={() => onColorSelect(color.hex)}
          title={color.name}
          style={{
            ...STYLES.colorButton(selectedColor === color.hex),
            backgroundColor: color.hex,
          }}
        />
      ))}
    </div>
  </div>
);

const StartPage = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [player1Color, setPlayer1Color] = useState("#00A6ED");
  const [player2Color, setPlayer2Color] = useState("#F6511D");
  const [lobbyPhase, setLobbyPhase] = useState<"name" | "lobby">("name");
  const [availableRooms, setAvailableRooms] = useState<RoomListing[]>([]);
  const [lobbyError, setLobbyError] = useState<string | null>(null);
  const [lobbyLoading, setLobbyLoading] = useState(false);
  const [scoreToWin, setScoreToWin] = useState(5);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const colyseusClientRef = useRef<Colyseus.Client | null>(null);

  // HUGO implement to front for colyseus room creation
  const getClient = useCallback(() => {
    if (!colyseusClientRef.current) {
      colyseusClientRef.current = new Colyseus.Client(SERVER_CONNECTION.WS_URL);
    }
    return colyseusClientRef.current;
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      const client = getClient();
      const rooms = await client.getAvailableRooms(
        SERVER_CONNECTION.ROOMS.PVP_ROOM,
      );
      const openRooms = rooms.filter(
        (r: any) => r.metadata?.waitingForOpponent && r.clients < 2,
      );
      setAvailableRooms(openRooms as unknown as RoomListing[]);
      setLobbyError(null);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setLobbyError("Failed to connect to server");
    }
  }, [getClient]);

  // HUGO implement in front
  useEffect(() => {
    if (selectedMode === "2p-online" && lobbyPhase === "lobby") {
      fetchRooms();
      pollIntervalRef.current = setInterval(fetchRooms, 3000);
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [selectedMode, lobbyPhase, fetchRooms]);

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    if (mode === "2p-online") setLobbyPhase("name");
  };

  const handleBackToMenu = () => {
    setSelectedMode(null);
    setPlayer1Name("");
    setPlayer2Name("");
    setPlayer1Color("#00A6ED");
    setPlayer2Color("#F6511D");
    setLobbyPhase("name");
    setAvailableRooms([]);
    setLobbyError(null);
    setScoreToWin(5);
  };

  const launchGame = (config: GameSessionConfig) => {
    const encoded = encodeConfig(config);
    navigate(`/canvas?config=${encoded}`);
  };

  const handleEnterLobby = () => setLobbyPhase("lobby");

  const handleCreateRoom = () => {
    const config: GameSessionConfig = {
      playerName: player1Name.trim() || "Player 1",
      playerColor: player1Color,
      gameMode: "online-create",
      winningScore: scoreToWin,
    };
    const encoded = encodeConfig(config);
    navigate(`/canvas?config=${encoded}`);
  };

  const handleJoinRoom = (roomId: string) => {
    const config: GameSessionConfig = {
      playerName: player1Name.trim() || "Player 1",
      playerColor: player1Color,
      gameMode: "online-join",
      roomId: roomId,
      winningScore: scoreToWin,
    };
    const encoded = encodeConfig(config);
    navigate(`/canvas?config=${encoded}`);
  };

  const handleStartGame = () => {
    if (!selectedMode) return;
    const p1Name = player1Name.trim() || "Player 1";
    const p2Name =
      selectedMode === "2p-local" ? player2Name.trim() || "Player 2" : "AI";

    const gameMode =
      selectedMode === "2p-local"
        ? "local-2p"
        : selectedMode === "2p-online"
          ? "online-create"
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

    launchGame(config);
  };

  const isAiMode = selectedMode?.startsWith("ai-");
  const isOnlineMode = selectedMode === "2p-online";

  if (isOnlineMode && lobbyPhase === "name") {
    return (
      <div style={STYLES.container}>
        <h1 style={STYLES.title}>Online PvP</h1>
        <div style={STYLES.formContainer}>
          <div style={{ width: "100%" }}>
            <label style={STYLES.label}>Your Name</label>
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Your Name"
              maxLength={20}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEnterLobby();
              }}
              style={STYLES.input}
            />
          </div>
          <ColorPicker
            selectedColor={player1Color}
            onColorSelect={setPlayer1Color}
            label="Choose Your Color"
          />
          <div style={{ width: "100%" }}>
            <label style={STYLES.label}>Score to win</label>
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
            <GameButton
              onClick={handleEnterLobby}
              color="#9C27B0"
              hoverColor="rgba(156, 39, 176, 0.4)"
            >
              Enter Lobby
            </GameButton>
          </div>
        </div>
      </div>
    );
  }

  if (isOnlineMode && lobbyPhase === "lobby") {
    return (
      <div style={STYLES.container}>
        <h1 style={STYLES.title}>Online PvP Lobby</h1>
        <p
          style={{
            color: "#aaa",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Playing as:
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                backgroundColor: player1Color,
                border: "2px solid #666",
              }}
            />
            <span style={{ color: player1Color, fontWeight: "bold" }}>
              {player1Name}
            </span>
          </span>
        </p>
        {lobbyError && (
          <div
            style={{
              padding: "10px 20px",
              backgroundColor: "#f4433622",
              border: "1px solid #f44336",
              borderRadius: "8px",
              color: "#f44336",
              fontSize: "14px",
              maxWidth: "350px",
              textAlign: "center",
            }}
          >
            {lobbyError}
          </div>
        )}
        <div style={STYLES.roomList}>
          {availableRooms.length === 0 ? (
            <div
              style={{
                padding: "20px",
                backgroundColor: "#2d2d44",
                borderRadius: "8px",
                color: "#888",
                textAlign: "center",
              }}
            >
              No open rooms. Create one!
            </div>
          ) : (
            availableRooms.map((room) => (
              <div key={room.roomId} style={STYLES.roomItem}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: room.metadata?.player1Color || "#00A6ED",
                      border: "2px solid #666",
                    }}
                  />
                  <span style={{ color: "white", fontSize: "16px" }}>
                    {room.metadata?.player1Name || "Unknown"}
                  </span>
                </div>
                <button
                  onClick={() => handleJoinRoom(room.roomId)}
                  disabled={lobbyLoading}
                  style={{
                    padding: "8px 20px",
                    fontSize: "14px",
                    backgroundColor: lobbyLoading ? "#666" : "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: lobbyLoading ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Join
                </button>
              </div>
            ))
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "10px",
            width: "350px",
          }}
        >
          <button onClick={handleBackToMenu} style={STYLES.backButton}>
            Back
          </button>
          <GameButton
            onClick={handleCreateRoom}
            color={lobbyLoading ? "#666" : "#9C27B0"}
            hoverColor="rgba(156, 39, 176, 0.4)"
          >
            Create Room
          </GameButton>
          <button
            onClick={fetchRooms}
            style={{
              padding: "15px 15px",
              fontSize: "16px",
              backgroundColor: "#333",
              color: "#aaa",
              border: "1px solid #555",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            title="Refresh room list"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (selectedMode && !isOnlineMode) {
    return (
      <div style={STYLES.container}>
        <h1 style={STYLES.title}>Enter Player Names</h1>
        <div style={STYLES.formContainer}>
          <div style={{ width: "100%" }}>
            <label style={STYLES.label}>
              {isAiMode ? "Your Name" : "Player 1 Name"}
            </label>
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder={isAiMode ? "Your Name" : "Player 1"}
              maxLength={20}
              autoFocus
              style={STYLES.input}
            />
          </div>
          <ColorPicker
            selectedColor={player1Color}
            onColorSelect={setPlayer1Color}
            label={isAiMode ? "Choose Your Color" : "Player 1 Color"}
          />
          {selectedMode === "2p-local" && (
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
              <ColorPicker
                selectedColor={player2Color}
                onColorSelect={setPlayer2Color}
                label="Player 2 Color"
              />
            </>
          )}
          {isAiMode && (
            <div
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#2d2d44",
                borderRadius: "8px",
                color: "#888",
                textAlign: "center",
              }}
            >
              Opponent: AI ({selectedMode.replace("ai-", "").toUpperCase()})
            </div>
          )}
          <div style={{ width: "100%" }}>
            <label style={STYLES.label}>Score to win</label>
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
            <GameButton
              onClick={handleStartGame}
              color="#4CAF50"
              hoverColor="rgba(76, 175, 80, 0.4)"
            >
              Start Game
            </GameButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={STYLES.container}>
      <h1 style={STYLES.mainTitle}>SkyPong 3D</h1>
      <div style={STYLES.section}>
        <p style={{ color: "#aaa", marginBottom: "10px", fontSize: "18px" }}>
          Single Player vs AI
        </p>
        <GameButton
          onClick={() => handleModeSelect("ai-easy")}
          color="#4CAF50"
          hoverColor="rgba(76, 175, 80, 0.4)"
        >
          Easy
        </GameButton>
        <GameButton
          onClick={() => handleModeSelect("ai-medium")}
          color="#FF9800"
          hoverColor="rgba(255, 152, 0, 0.4)"
        >
          Medium
        </GameButton>
        <GameButton
          onClick={() => handleModeSelect("ai-hard")}
          color="#f44336"
          hoverColor="rgba(244, 67, 54, 0.4)"
        >
          Hard
        </GameButton>
      </div>
      <div style={{ ...STYLES.section, ...STYLES.sectionDivider }}>
        <p style={{ color: "#aaa", marginBottom: "10px", fontSize: "18px" }}>
          Multiplayer
        </p>
        <GameButton
          onClick={() => handleModeSelect("2p-online")}
          color="#9C27B0"
          hoverColor="rgba(156, 39, 176, 0.4)"
        >
          Online PvP
        </GameButton>
        <GameButton
          onClick={() => handleModeSelect("2p-local")}
          color="#2196F3"
          hoverColor="rgba(33, 150, 243, 0.4)"
        >
          2 Player Local
        </GameButton>
      </div>
      <div
        style={{
          marginTop: "40px",
          color: "#666",
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        <p>Controls:</p>
        <p>Player 1 (Near): A/D or Arrow Keys</p>
        <p>Player 2 (Far): J/L keys (Local 2P only)</p>
      </div>
    </div>
  );
};

export default StartPage;
