/**
 * Client timing configuration
 * Used for countdowns, collision windows, and client-side timing
 */

export const CLIENT_TIMING = {
  COUNTDOWN: {
    DURATION_SECONDS: 3,
    INTERVAL_MS: 1000,
  },

  COLLISION: {
    // How long to use enhanced lerp speed after collision event
    // Approach A uses this for smooth but responsive collision handling
    WINDOW_MS: 150,
  },
} as const;
