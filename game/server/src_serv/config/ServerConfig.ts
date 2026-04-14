/**
 * Server configuration
 * Environment-aware settings for the game server
 */

import { NETWORK } from "@skypong/common/constants";

export const SERVER_CONFIG = {
    PORT: parseInt(process.env.PORT || "2567", 10),
    SIMULATION_FPS: 60,
    SIMULATION_INTERVAL_MS: NETWORK.SYNC.SIMULATION_INTERVAL_MS,
    /** Enable debug logging output */
    DEBUG_MODE: process.env.DEBUG_MODE === "true" || false,
} as const;
