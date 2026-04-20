import { z } from "zod";
import type { TranslationDictionary } from "@/lib/types/translation";

/** Supported game modes for launch configuration. */
export const GAME_MODES = ["AI", "ONLINE", "LOCAL"] as const;

/** Supported AI difficulties. */
export const GAME_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

/** Shared game configuration payload used across launcher and canvas routes. */
export interface GameConfig {
  readonly mode: (typeof GAME_MODES)[number];
  readonly difficulty?: (typeof GAME_DIFFICULTIES)[number];
  readonly pointsToWin: number;
  readonly ballColor: string;
  readonly roomId?: string;
  readonly onlineRole?: "create" | "join";
}

function createGameConfigSchema(t?: TranslationDictionary) {
  const gameErrors = t?.game?.errors;

  const messages = {
    difficultyRequired:
      gameErrors?.difficultyRequired || "AI mode requires a difficulty setting.",
    diffultyOnlyAIMode:
      gameErrors?.difficultyOnlyAIMode || "Only AI mode can include difficulty.",
    onlineRoleOnlyForOlineMode:
      gameErrors?.onlineRoleOnlyForOnlineMode ||
      "Only ONLINE mode can include onlineRole.",
  };
  return z
    .object({
      mode: z.enum(GAME_MODES),
      difficulty: z.enum(GAME_DIFFICULTIES).optional(),
      pointsToWin: z.number().int().min(3).max(11),
      ballColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      roomId: z.string().min(1).optional(),
      onlineRole: z.enum(["create", "join"]).optional(),
    })
    .superRefine((value, ctx) => {
      if (value.mode === "AI" && !value.difficulty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messages.difficultyRequired,
        });
      }

      if (value.mode !== "AI" && value.difficulty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messages.diffultyOnlyAIMode,
        });
      }

      if (value.mode !== "ONLINE" && value.onlineRole) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messages.onlineRoleOnlyForOlineMode,
        });
      }
    });
}

const gameConfigSchema = createGameConfigSchema();

function toBase64Url(value: string): string {
  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

/**
 * Encodes a game configuration to an URL-safe base64 string.
 */
export function encodeGameConfig(config: GameConfig): string {
  const normalized = gameConfigSchema.parse(config);
  return toBase64Url(JSON.stringify(normalized));
}

/**
 * Decodes and validates a URL-safe base64 encoded game configuration.
 */
export function decodeGameConfig(encodedConfig: string): GameConfig {
  const parsedPayload: unknown = JSON.parse(fromBase64Url(encodedConfig));
  return gameConfigSchema.parse(parsedPayload);
}
