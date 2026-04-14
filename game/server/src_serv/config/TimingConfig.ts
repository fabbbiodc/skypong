/**
 * Server timing configuration
 * Timing parameters for respawns and game flow
 */

export const SERVER_TIMING = {
    RESPAWN: {
        POST_GOAL_DELAY_MS: 1000,
        RELAUNCH_DELAY_MS: 500,
    },
} as const;
