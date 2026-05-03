// /game/client/src_cli/utils/configDecoder.ts
// Base64 encoding/decoding and validation for GameSessionConfig

import {
  GameSessionConfig,
  DecodeResult,
  VALID_GAME_MODES,
  GameMode,
} from "../types/GameSessionConfig";

/**
 * Encodes a GameSessionConfig object to base64 string
 * Use this in the frontend (Next.js) before navigating to /launch
 */
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

/**
 * Decodes and validates a base64-encoded configuration string
 * Returns either a valid config or an error object
 */
export function decodeConfig(base64String: string | null): DecodeResult {
  // Check if config parameter exists
  if (!base64String) {
    return {
      valid: false,
      error: "No configuration provided in URL",
    };
  }

  // Decode base64
  let jsonString: string;
  try {
    jsonString = atob(base64String);
  } catch (error) {
    return {
      valid: false,
      error: "Failed to decode configuration. Invalid base64 format.",
    };
  }

  // Parse JSON
  let config: Partial<GameSessionConfig>;
  try {
    config = JSON.parse(jsonString);
  } catch (error) {
    return {
      valid: false,
      error: "Failed to parse configuration. Invalid JSON format.",
    };
  }

  // Validate required fields
  const missingFields: string[] = [];

  if (!config.playerName) missingFields.push("playerName");
  if (!config.playerColor) missingFields.push("playerColor");
  if (!config.gameMode) missingFields.push("gameMode");

  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(", ")}`,
      missingFields,
    };
  }

  // Validate optional playerId - if provided, must be non-empty string
  if (config.playerId !== undefined && typeof config.playerId !== "string") {
    return {
      valid: false,
      error: "playerId must be a string if provided",
    };
  }

  // Validate optional player2Id - if provided, must be non-empty string
  if (config.player2Id !== undefined && typeof config.player2Id !== "string") {
    return {
      valid: false,
      error: "player2Id must be a string if provided",
    };
  }

  // Validate gameMode is valid
  const gameMode = config.gameMode as GameMode;
  if (!VALID_GAME_MODES.includes(gameMode)) {
    return {
      valid: false,
      error: `Invalid gameMode: '${config.gameMode}'. Must be one of: ${VALID_GAME_MODES.join(", ")}`,
    };
  }

   // Validate mode-specific required fields
    if (gameMode === "local-2p" && !config.player2Name) {
      return {
        valid: false,
        error: "player2Name is required for local-2p mode",
        missingFields: ["player2Name"],
      };
    }

  // Validate optional winningScore
  if (config.winningScore !== undefined) {
    const validScores = [3, 5, 7, 9, 11];
    if (!validScores.includes(config.winningScore)) {
      return {
        valid: false,
        error: `Invalid winningScore: '${config.winningScore}'. Must be one of: ${validScores.join(", ")}`,
      };
    }
  }

  // Validate optional language - if provided, must be valid
  if (config.language !== undefined) {
    const validLanguages = ["en", "es", "it"];
    if (!validLanguages.includes(config.language)) {
      return {
        valid: false,
        error: `Invalid language: '${config.language}'. Must be one of: ${validLanguages.join(", ")}`,
      };
    }
  }

  // Apply defaults
  config.language ??= "en";

  // All validations passed
  return {
    valid: true,
    config: config as GameSessionConfig,
  };
}
