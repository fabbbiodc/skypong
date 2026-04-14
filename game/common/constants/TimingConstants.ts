/**
 * Timing and delay configuration for game events
 */
export const TIMING = {
    COUNTDOWN: {
        /** Countdown duration in seconds before ball launch */
        DURATION_SECONDS: 3,
        /** Interval between countdown ticks (milliseconds) */
        INTERVAL_MS: 1000,
    },
    RESPAWN: {
        /** Delay before ball respawns after falling off table (milliseconds) */
        DELAY_MS: 1000,
        /** Additional delay after respawn before relaunching ball (milliseconds) */
        RELAUNCH_DELAY_MS: 500,
    },
    ROOM: {
        /** Delay before disposing room after all players leave (milliseconds) */
        DISPOSAL_DELAY_MS: 100,
    },
    COLLISION: {
        /** Time window for collision detection validity (milliseconds) */
        WINDOW_MS: 200,
    },
} as const;
