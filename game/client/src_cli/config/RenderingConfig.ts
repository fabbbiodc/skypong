/**
 * Rendering configuration for lights, shadows, and environment
 * Used by SceneLights and rendering setup
 */

import { Color3, Vector3 } from "@babylonjs/core";

export const RENDERING = {
  CLEAR_COLOR: "#191919FF",

  RENDERING_GROUPS: {
    DEFAULT: 0,
    GAME_OBJECTS: 1,
  },

  ENVIRONMENT: {
    TEXTURE_PATH: "./environment/dramatic-sky1.exr",
    TEXTURE_SIZE: 512,
    INTENSITY: 1,
    SKYBOX_SCALE: 1000,
  },

  LIGHTS: {
    HEMISPHERIC: {
      INTENSITY: 0.5,
      DIFFUSE: new Color3(1, 1, 1),
      GROUND_COLOR: new Color3(0.2, 0.2, 0.2),
    },
    DIRECTIONAL: {
      POSITION: new Vector3(20, 40, 20),
      DIRECTION: new Vector3(-1, -2, -1),
      INTENSITY: 1,
    },
    POINT: {
      POSITION: new Vector3(0, 5, 0),
      INTENSITY: 0.8,
      DIFFUSE: new Color3(1, 0.9, 0.7),
      SPECULAR: new Color3(1, 1, 1),
    },
  },

  SHADOWS: {
    MAP_SIZE: 1024,
    BLUR_KERNEL: 16,
  },
} as const;
