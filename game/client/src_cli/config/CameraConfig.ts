/**
 * Camera configuration
 * Used by Camera utility and test scenes
 */

import { Vector3 } from "@babylonjs/core";

export const CAMERA = {
  DEFAULT_POSITION: new Vector3(0, 10, -20),
  TOP_DOWN_POSITION: new Vector3(0, 50, 0),
  INTRO_START_POSITION: new Vector3(0, 30, -60),
  INTRO_START_POSITION_TOP_DOWN: new Vector3(0, 80, 0),
  INTRO_ANIMATION_DURATION_MS: 1500,
  MARGIN: 1.2,

  TEST_SCENE: {
    ALPHA: Math.PI / 4,
    BETA: Math.PI / 2.5,
    RADIUS: 5,
    MIN_Z: 0.1,
    WHEEL_PRECISION: 50,
  },
} as const;
