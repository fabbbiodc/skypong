export type GameMode =
  | "ai-easy"
  | "ai-medium"
  | "ai-hard"
  | "local-2p"
  | "online-create"
  | "online-join";

export interface GameSessionConfig {
  playerId?: string;
  player2Id?: string;
  playerName: string;
  playerColor: string;
  gameMode: GameMode;
  player2Name?: string;
  player2Color?: string;
  roomId?: string;
  cameraView?: "angled" | "top-down";
  winningScore?: number;
  language?: "en" | "es" | "it";
}

export const VALID_GAME_MODES: GameMode[] = [
  "local-2p",
  "online-create",
  "online-join",
  "ai-easy",
  "ai-medium",
  "ai-hard",
];

export function encodeConfig(config: GameSessionConfig): string {
  try {
    const jsonString = JSON.stringify(config);
    return btoa(jsonString);
  } catch (error) {
    throw new Error(
      "Failed to encode configuration: " + (error as Error).message,
    );
  }
}

export function decodeConfig(
  base64String: string | null,
): GameSessionConfig | null {
  if (!base64String) {
    return null;
  }

  let jsonString: string;
  try {
    jsonString = atob(base64String);
  } catch {
    return null;
  }

  let config: Partial<GameSessionConfig>;
  try {
    config = JSON.parse(jsonString);
  } catch {
    return null;
  }

  if (!config.playerName || !config.playerColor || !config.gameMode) {
    return null;
  }

  const gameMode = config.gameMode as GameMode;
  if (!VALID_GAME_MODES.includes(gameMode)) {
    return null;
  }

  if (gameMode === "local-2p" && !config.player2Name) {
    return null;
  }

  if (gameMode === "online-join" && !config.roomId) {
    return null;
  }

  if (config.winningScore !== undefined) {
    const validScores = [3, 5, 7, 9, 11];
    if (!validScores.includes(config.winningScore)) {
      return null;
    }
  }

  return config as GameSessionConfig;
}
