/**
 * GameSceneBackground Configuration
 *
 * Controls the rotating skybox background for the frontend.
 * Mirrors the game's scene setup but optimized for background use.
 */

import { Color3, Vector3 } from "@babylonjs/core";

export const GAME_SCENE_BG_CONFIG = {
  // Environment texture (symlinked from game/client/public)
  ENVIRONMENT: {
    TEXTURE_PATH: "./environment/dramatic-sky1.exr",
    TEXTURE_SIZE: 512,
    INTENSITY: 1,
    SKYBOX_SCALE: 1000,
  },

  // Camera setup
  CAMERA: {
    DISTANCE: 1, // No camera movement, just rotation around center
    HEIGHT: 0,
  },

  // Rotation animation
  ROTATION: {
    SPEED: 0.0001, // Radians per frame at 60 FPS
    // At 60 FPS: ~1 full rotation (2π) per ~1,047 frames = ~17.4 seconds per revolution
    // To adjust: increase for faster, decrease for slower
    AXIS: new Vector3(0, 1, 0), // Rotate around Y-axis (vertical)
  },

  // Scene clearing
  CLEAR_COLOR: new Color3(0.1, 0.1, 0.1), // Fallback if skybox fails
  USE_HDR: true, // Use HDR rendering for better color fidelity

  // Performance & optimization
  RENDER_TARGET_SIZE: 512,
  ADAPTIVE_QUALITY: true, // Reduce quality if frame rate drops
  MAX_FPS: 60,

  // Texture loading timeout (ms)
  LOAD_TIMEOUT: 3000,

  // Disable features for background use
  FEATURES: {
    USE_LIGHTS: false, // No lighting for background
    USE_PHYSICS: false, // No physics simulation
    USE_SHADOWS: false, // No shadow mapping
  },
} as const;

export type GameSceneBackgroundConfig = typeof GAME_SCENE_BG_CONFIG;
