/**
 * Timing and delay configuration for game events
 */
export declare const TIMING: {
    readonly COUNTDOWN: {
        /** Countdown duration in seconds before ball launch */
        readonly DURATION_SECONDS: 3;
        /** Interval between countdown ticks (milliseconds) */
        readonly INTERVAL_MS: 1000;
    };
    readonly RESPAWN: {
        /** Delay before ball respawns after falling off table (milliseconds) */
        readonly DELAY_MS: 1000;
        /** Additional delay after respawn before relaunching ball (milliseconds) */
        readonly RELAUNCH_DELAY_MS: 500;
    };
    readonly ROOM: {
        /** Delay before disposing room after all players leave (milliseconds) */
        readonly DISPOSAL_DELAY_MS: 100;
    };
    readonly COLLISION: {
        /** Time window for collision detection validity (milliseconds) */
        readonly WINDOW_MS: 200;
    };
};
