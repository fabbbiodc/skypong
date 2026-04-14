// /game/client/src_cli/types/GameSessionConfig.ts
// Unified configuration interface for game entrypoint

import { Language } from "../config/UITexts";

export type GameMode =
  | "ai-easy"
  | "ai-medium"
  | "ai-hard"
  | "local-2p"
  | "online-create"
  | "online-join";

// FRONT interface for game configuration
export interface GameSessionConfig {
  // Optional - auth related
  playerId?: string; // User ID from auth (if logged in)
  player2Id?: string; // For local-2p mode

  // Required for all modes
  playerName: string; // Display name
  playerColor: string; // Paddle color (hex, e.g., "#00A6ED")
  gameMode: GameMode;

  // Optional - mode specific
  player2Name?: string; // Required for local-2p mode
  player2Color?: string; // Optional for local-2p (defaults to "#F6511D")
  roomId?: string; // Required for online-join mode
  cameraView?: "angled" | "top-down";
  winningScore?: number; // Points needed to win (3, 5, 7, 9, 11)
  language?: Language; // UI language (defaults to 'en')
}

export interface ValidationError {
  valid: false;
  error: string;
  missingFields?: string[];
}

export interface ValidationSuccess {
  valid: true;
  config: GameSessionConfig;
}

export type DecodeResult = ValidationSuccess | ValidationError;

export const VALID_GAME_MODES: GameMode[] = [
  "local-2p",
  "online-create",
  "online-join",
  "ai-easy",
  "ai-medium",
  "ai-hard",
];
