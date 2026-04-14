/**
 * Visual configuration for colors and game effects
 * Used by game entities
 */

import { Color3 } from "@babylonjs/core";

export const VISUAL = {
  PADDLES: {
    PLAYER1: {
      ALBEDO: new Color3(0.2, 0.4, 1.0),
      TINT: new Color3(0.7, 0.8, 1.0),
    },
    PLAYER2: {
      ALBEDO: new Color3(1.0, 0.2, 0.2),
      TINT: new Color3(1.0, 0.7, 0.7),
    },
  },

  SMOOTHING: {
    PADDLE_LERP_SPEED: 10.0,
  },
} as const;
