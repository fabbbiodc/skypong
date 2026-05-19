import type { GameConfig } from "./launch-config";

/**
 * Configuration payload expected by the Babylon game engine launcher.
 */
export interface EngineLaunchConfig {
  readonly playerName: string;
  readonly playerColor: string;
  readonly gameMode:
    | "ai-easy"
    | "ai-medium"
    | "ai-hard"
    | "local-2p"
    | "online-create"
    | "online-join";
  readonly player2Name?: string;
  readonly player2Color?: string;
  readonly roomId?: string;
  readonly winningScore?: number;
}

interface EngineLaunchLabels {
  player1?: string;
  player2?: string;
}

const DEFAULT_ENGINE_LABELS: Required<EngineLaunchLabels> = {
  player1: "Player 1",
  player2: "Player 2",
};

/**
 * Maps the front-end game setup configuration to the game engine launch contract.
 */
export function toEngineLaunchConfig(
  config: GameConfig,
  labels: EngineLaunchLabels = {},
): EngineLaunchConfig {
  const resolvedLabels = {
    ...DEFAULT_ENGINE_LABELS,
    ...labels,
  };

  const player1 = config.player1Name || resolvedLabels.player1;
  const player2 = config.player2Name || resolvedLabels.player2;
  const p1Color = config.player1Color || "#00A6ED";
  const p2Color = config.player2Color || "#F6511D";

  if (config.mode === "AI") {
    return {
      playerName: player1,
      playerColor: p1Color,
      gameMode:
        `ai-${config.difficulty.toLowerCase()}` as EngineLaunchConfig["gameMode"],
      player2Name: "AI",
      winningScore: config.pointsToWin,
    };
  }

  if (config.mode === "LOCAL") {
    return {
      playerName: player1,
      playerColor: p1Color,
      gameMode: "local-2p",
      player2Name: player2,
      player2Color: p2Color,
      winningScore: config.pointsToWin,
    };
  }

  return {
    playerName: player1,
    playerColor: p1Color,
    gameMode: config.onlineRole === "join" ? "online-join" : "online-create",
    roomId: config.roomId,
    winningScore: config.pointsToWin,
  };
}

/**
 * Encodes an engine launch configuration into base64 for the launcher query param.
 */
export function encodeEngineLaunchConfig(config: EngineLaunchConfig): string {
  return btoa(JSON.stringify(config));
}
