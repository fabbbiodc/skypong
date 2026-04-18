"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { encodeConfig } from "../lib/game/game-session-config";
import { getAvailableRooms } from "../lib/game/room-service";
import { useAuth } from "../context/auth-context";
import { useTranslation } from "../hooks/use-translation";
import { useMediaQuery } from "../hooks/use-media-query";
import { Button, TextField, Navbar, Footer } from "../ui/base";
import { PageContainer, ContentContainer } from "../ui/patterns";

const STATES = {
  SELECT_MODE: "SELECT_MODE",
  AI_SELECT_DIFFICULTY: "AI_SELECT_DIFFICULTY",
  CONFIGURE_GAME: "CONFIGURE_GAME",
  MULTIPLAYER_MENU: "MULTIPLAYER_MENU",
  ONLINE_LOBBY: "ONLINE_LOBBY",
  ONLINE_CREATE_ROOM: "ONLINE_CREATE_ROOM",
  ONLINE_JOIN_ROOM: "ONLINE_JOIN_ROOM",
  ONLINE_WAITING: "ONLINE_WAITING",
  LOCAL_P1_SETUP: "LOCAL_P1_SETUP",
  LOCAL_P2_SETUP: "LOCAL_P2_SETUP",
  LOADING: "LOADING",
  PLAYING: "PLAYING",
};

const INITIAL_CONFIG = {
  playerName: "",
  playerColor: "#00A6ED",
  gameMode: "ai-easy",
  winningScore: 5,
};

const PLAYER_COLORS = [
  { hex: "#F6511D", name: "Red-Orange" },
  { hex: "#00A6ED", name: "Cyan Blue" },
  { hex: "#B084CC", name: "Purple" },
  { hex: "#6B8F71", name: "Sage Green" },
  { hex: "#F4E04D", name: "Yellow" },
];

function ColorPicker({ selectedColor, onColorSelect, label }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <div className="flex flex-wrap gap-3">
        {PLAYER_COLORS.map((color) => (
          <button
            key={color.hex}
            type="button"
            onClick={() => onColorSelect(color.hex)}
            title={color.name}
            className="h-10 w-10 rounded-full border-2 transition"
            style={{
              backgroundColor: color.hex,
              borderColor:
                selectedColor === color.hex ? "#0f172a" : "transparent",
              boxShadow:
                selectedColor === color.hex
                  ? `0 0 0 3px ${color.hex}80`
                  : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function GameOverlay({ gameUrl, onExit }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "game-exit") {
        onExit();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-[1000] bg-white">
      <iframe
        ref={iframeRef}
        src={gameUrl}
        title="Game"
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}

function PlayPanel({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm font-semibold text-muted sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export default function PlayPage() {
  const router = useRouter();
  const [state, setState] = useState(STATES.SELECT_MODE);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomError, setRoomError] = useState(null);
  const [gameUrl, setGameUrl] = useState("");
  const [error, setError] = useState(null);

  const { user, hasCredentials } = useAuth();
  const { t, locale } = useTranslation();
  const isDesktop = useMediaQuery("(min-width: 745px)");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setError(params.get("error"));
  }, []);

  useEffect(() => {
    if (user?.nickname) {
      setConfig((prev) => ({ ...prev, playerName: user?.nickname }));
    }
  }, [user]);

  useEffect(() => {
    if (state !== STATES.PLAYING) {
      return undefined;
    }

    // Only generate URL if we're in PLAYING state but don't have a URL yet
    // This handles the ONLINE_WAITING -> PLAYING transition
    const initTimer = window.setTimeout(() => {
      setGameUrl((currentUrl) => {
        // Don't overwrite if URL is already set
        if (currentUrl) return currentUrl;

        const finalConfig = {
          ...config,
          playerId: user?.id,
          playerName: config.playerName || user?.nickname || "Player 1",
          language: locale,
        };
        const encoded = encodeConfig(finalConfig);
        return `/game-engine/canvas?config=${encodeURIComponent(encoded)}`;
      });
    }, 50);

    return () => window.clearTimeout(initTimer);
  }, [config, state, user, locale]);

  useEffect(() => {
    if (state !== STATES.ONLINE_WAITING) {
      return undefined;
    }

    const readyTimer = window.setTimeout(() => {
      setState(STATES.PLAYING);
    }, 1500);

    return () => window.clearTimeout(readyTimer);
  }, [state]);

  const handleGameExit = () => {
    setGameUrl("");
    setState(STATES.SELECT_MODE);
  };

  const refreshRooms = async () => {
    setLoadingRooms(true);
    setRoomError(null);
    try {
      const availableRooms = await getAvailableRooms();
      setRooms(availableRooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      setRoomError("Failed to load rooms. Please try again.");
    } finally {
      setLoadingRooms(false);
    }
  };

  const startLoadingWithConfig = (nextConfig) => {
    // Encode and set game URL directly to avoid race condition
    const finalConfig = {
      ...nextConfig,
      playerId: user?.id,
      playerName: nextConfig.playerName || user?.nickname || "Player 1",
      language: locale,
    };
    const encoded = encodeConfig(finalConfig);
    const url = `/game-engine/canvas?config=${encodeURIComponent(encoded)}`;

    setConfig(nextConfig);
    setGameUrl(url);
    setState(STATES.PLAYING);
  };

  if (state === STATES.PLAYING) {
    if (!gameUrl) {
      // Show a minimal loading state while gameUrl is being generated
      return (
        <div className="fixed inset-0 z-[1000] bg-white flex items-center justify-center">
          <div className="text-2xl font-semibold text-slate-900">
            Loading...
          </div>
        </div>
      );
    }
    return <GameOverlay gameUrl={gameUrl} onExit={handleGameExit} />;
  }

  return (
    <main className="h-dvh bg-page-bg text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <PageContainer>
          <ContentContainer size="xl">
            <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 py-4 md:gap-8 md:py-6 lg:gap-10 lg:py-10">
            <div className="flex w-full flex-col items-center gap-4">
              {error && (
                <p className="error-message text-sm">
                  {t.play.error} {error}
                </p>
              )}

              {state === STATES.SELECT_MODE && (
                <PlayPanel title="Pong" subtitle={t.play.chooseGameMode}>
                  {isDesktop && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => {
                        setConfig((prev) => ({
                          ...prev,
                          gameMode: "local-2p",
                        }));
                        setState(STATES.LOCAL_P1_SETUP);
                      }}
                    >
                      {t.play.local}
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setConfig((prev) => ({ ...prev, gameMode: "ai-easy" }));
                      setState(STATES.AI_SELECT_DIFFICULTY);
                    }}
                  >
                    {t.play.ai}
                  </Button>
                  {hasCredentials && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => setState(STATES.MULTIPLAYER_MENU)}
                    >
                      {t.play.multiplayer}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => router.push("/")}
                  >
                    {t.play.back}
                  </Button>
                </PlayPanel>
              )}

              {state === STATES.AI_SELECT_DIFFICULTY && (
                <PlayPanel title="AI" subtitle={t.play.selectDifficulty}>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setConfig((prev) => ({ ...prev, gameMode: "ai-easy" }));
                      setState(STATES.CONFIGURE_GAME);
                    }}
                  >
                    {t.play.easy}
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setConfig((prev) => ({ ...prev, gameMode: "ai-medium" }));
                      setState(STATES.CONFIGURE_GAME);
                    }}
                  >
                    {t.play.medium}
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setConfig((prev) => ({ ...prev, gameMode: "ai-hard" }));
                      setState(STATES.CONFIGURE_GAME);
                    }}
                  >
                    {t.play.hard}
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setState(STATES.SELECT_MODE)}
                  >
                    {t.play.back}
                  </Button>
                </PlayPanel>
              )}

              {state === STATES.MULTIPLAYER_MENU && hasCredentials && (
                <PlayPanel
                  title="Multiplayer"
                  subtitle={t.play.multiplayerChooseMode}
                >
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setState(STATES.ONLINE_LOBBY)}
                  >
                    {t.play.onlinePvp}
                  </Button>
                  {isDesktop && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => {
                        setConfig((prev) => ({
                          ...prev,
                          gameMode: "local-2p",
                        }));
                        setState(STATES.LOCAL_P1_SETUP);
                      }}
                    >
                      {t.play.localPvp}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setState(STATES.SELECT_MODE)}
                  >
                    {t.play.back}
                  </Button>
                </PlayPanel>
              )}

              {state === STATES.ONLINE_LOBBY && (
                <PlayPanel title="Online" subtitle={t.play.multiplayerLobby}>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setConfig((prev) => ({
                        ...prev,
                        playerName:
                          user?.nickname || prev.playerName || "Player 1",
                        gameMode: "online-create",
                      }));
                      setState(STATES.CONFIGURE_GAME);
                    }}
                  >
                    {t.play.createRoom}
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      refreshRooms();
                      setState(STATES.ONLINE_JOIN_ROOM);
                    }}
                  >
                    {t.play.joinRoom}
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setState(STATES.MULTIPLAYER_MENU)}
                  >
                    {t.play.back}
                  </Button>
                </PlayPanel>
              )}

              {state === STATES.ONLINE_JOIN_ROOM && (
                <PlayPanel title="Rooms" subtitle={t.play.chooseAvailableRoom}>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={refreshRooms}
                    disabled={loadingRooms}
                  >
                    {loadingRooms ? t.play.loading : t.play.refresh}
                  </Button>
                  {roomError && (
                    <p className="error-message text-sm">
                      {t.play.failedLoadRooms}
                    </p>
                  )}
                  {rooms.length === 0 && !loadingRooms && (
                    <p className="text-sm text-slate-700">
                      {t.play.noRoomsAvailable}
                    </p>
                  )}
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3"
                    >
                      <span className="text-sm font-medium text-gray-800">
                        {room.creatorName
                          ? `${room.creatorName}${t.play.room}`
                          : room.name}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        className="shrink-0"
                        onClick={() => {
                          setConfig((prev) => ({
                            ...prev,
                            gameMode: "online-join",
                            roomId: room.id,
                          }));
                          setState(STATES.CONFIGURE_GAME);
                        }}
                      >
                        {t.play.join}
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setState(STATES.ONLINE_LOBBY)}
                  >
                    {t.play.back}
                  </Button>
                </PlayPanel>
              )}

              {state === STATES.ONLINE_WAITING && (
                <PlayPanel title="Online" subtitle={t.play.waitingForOpponent}>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setState(STATES.ONLINE_LOBBY)}
                  >
                    {t.play.cancel}
                  </Button>
                </PlayPanel>
              )}

              {state === STATES.CONFIGURE_GAME && (
                <PlayPanel title="Setup" subtitle={t.play.configureMatch}>
                  {user?.nickname ? (
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-semibold uppercase tracking-wide text-muted">
                        {t.play.name}
                      </label>
                      <p className="text-lg font-display font-semibold text-primary">
                        {user?.nickname}
                      </p>
                    </div>
                  ) : (
                    <TextField
                      label={t.play.name}
                      type="text"
                      placeholder={t.play.enterYourName}
                      value={config.playerName || ""}
                      onChange={(value) =>
                        setConfig((prev) => ({ ...prev, playerName: value }))
                      }
                    />
                  )}
                  {config.gameMode !== "online-join" && (
                    <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                      {t.play.pointsToWin}
                      <select
                        value={config.winningScore}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            winningScore: Number(e.target.value),
                          }))
                        }
                        className="rounded-xl border border-slate-500 bg-white px-4 py-3 text-base font-medium text-slate-900"
                      >
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                        <option value={7}>7</option>
                        <option value={9}>9</option>
                        <option value={11}>11</option>
                      </select>
                    </label>
                  )}
                  <ColorPicker
                    selectedColor={config.playerColor}
                    onColorSelect={(hex) =>
                      setConfig((prev) => ({ ...prev, playerColor: hex }))
                    }
                    label={t.play.paddleColor}
                  />
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      const finalConfig = {
                        ...config,
                        playerName: config.playerName || "Player 1",
                        player2Name: config.gameMode.startsWith("ai-")
                          ? "AI"
                          : config.player2Name,
                      };
                      if (finalConfig.gameMode === "online-create") {
                        setConfig(finalConfig);
                        setState(STATES.ONLINE_WAITING);
                      } else {
                        startLoadingWithConfig(finalConfig);
                      }
                    }}
                  >
                    {config.gameMode === "online-create"
                      ? t.play.createAndWait
                      : t.play.play}
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      if (config.gameMode.startsWith("ai-"))
                        setState(STATES.AI_SELECT_DIFFICULTY);
                      else if (config.gameMode === "online-create")
                        setState(STATES.ONLINE_LOBBY);
                      else if (config.gameMode === "online-join")
                        setState(STATES.ONLINE_JOIN_ROOM);
                      else setState(STATES.ONLINE_LOBBY);
                    }}
                  >
                    {t.play.back}
                  </Button>
                </PlayPanel>
              )}

              {state === STATES.LOCAL_P1_SETUP && (
                <PlayPanel title="Player 1" subtitle={t.play.playerSetup}>
                  <TextField
                    label={t.play.name}
                    type="text"
                    value={config.playerName || ""}
                    onChange={(value) =>
                      setConfig((prev) => ({ ...prev, playerName: value }))
                    }
                  />
                  <ColorPicker
                    selectedColor={config.playerColor}
                    onColorSelect={(hex) =>
                      setConfig((prev) => ({ ...prev, playerColor: hex }))
                    }
                    label={t.play.paddleColor}
                  />
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setConfig((prev) => ({
                        ...prev,
                        playerName: prev.playerName || "Player 1",
                      }));
                      setState(STATES.LOCAL_P2_SETUP);
                    }}
                  >
                    {t.play.next}
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setState(STATES.SELECT_MODE)}
                  >
                    {t.play.back}
                  </Button>
                </PlayPanel>
              )}

              {state === STATES.LOCAL_P2_SETUP && (
                <PlayPanel title="Player 2" subtitle={t.play.playerSetup}>
                  <TextField
                    label={t.play.name}
                    type="text"
                    value={config.player2Name || ""}
                    onChange={(value) =>
                      setConfig((prev) => ({ ...prev, player2Name: value }))
                    }
                  />
                  <ColorPicker
                    selectedColor={config.player2Color || "#F6511D"}
                    onColorSelect={(hex) =>
                      setConfig((prev) => ({ ...prev, player2Color: hex }))
                    }
                    label={t.play.paddleColor}
                  />
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      const finalConfig = {
                        ...config,
                        player2Name: config.player2Name || "Player 2",
                        player2Color: config.player2Color || "#F6511D",
                      };
                      setConfig(finalConfig);
                      startLoadingWithConfig(finalConfig);
                    }}
                  >
                    {t.play.play}
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setState(STATES.LOCAL_P1_SETUP)}
                  >
                    {t.play.back}
                  </Button>
                </PlayPanel>
              )}
            </div>
          </section>
          </ContentContainer>
        </PageContainer>
      </div>
      <div className="mt-auto pb-4">
        <Footer />
      </div>
    </main>
  );
}
