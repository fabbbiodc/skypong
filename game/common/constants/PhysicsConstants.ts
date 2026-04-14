/**
 * Physics constants shared between client and server
 * Server uses these for authoritative physics calculations
 * Client uses these for visual effects and predictions
 */

export const PHYSICS = {
  GRAVITY: -0.01,

  BALL: {
    BOUNCE_RESTITUTION: 1.0,
    FRICTION: 0.0,
    MASS: 1.0,
    MAX_SPEED: 0.6, // Reduced from 1.0 to prevent physics breakdown at high speeds
  },

  PADDLE: {
    BOUNCE_RESTITUTION: 1.0,
    FRICTION: 0.0,
    MASS: 1.0,
  },

  COLLISION: {
    MAX_DISTANCE_SQ: 4.0,
    PADDLE_OFFSET: 0.0,
    /** Threshold for paddle collision detection */
    PADDLE_COLLISION_THRESHOLD: 0.1,
  },

  RESPAWN: {
    DELAY_MS: 1000, // 1 second before respawn
    FALL_THRESHOLD: -5,
  },

  /** Physics response parameters for collisions and ball behavior */
  RESPONSE: {
    /** Maximum bounce angle in degrees when ball hits paddle edge */
    MAX_BOUNCE_ANGLE_DEG: 70,

    /** Constant speed boost multiplier when ball hits paddle (1.05 = 5% increase per paddle hit) */
    PADDLE_SPEED_BOOST: 1.05,
  },

  /** Ball launch parameters for serving */
  LAUNCH: {
    /** Minimum angle from Z axis (degrees) */
    MIN_ANGLE_DEG: 10,
    /** Maximum angle from Z axis (degrees) */
    MAX_ANGLE_DEG: 45,
    /** Base speed magnitude */
    BASE_SPEED: 0.07,
  },
} as const;

export const INTERPOLATION = {
  DEFAULT_SPEED: 25.0, // Increased from 20.0 for faster following with extrapolation
  COLLISION_SPEED: 45.0, // Increased from 40.0 for tighter sync during bounces
  PADDLE_SPEED: 0.1,

  // Bounce constants removed in Approach A (not used)
  BOUNCE: {
    MIN_SPEED: 0.012,
    MAX_SPEED: 0.035,
    MIN_DISTANCE: 0.03,
  },
} as const;

// Client-server synchronization constants
export const SYNC = {
  // Maximum allowed deviation between client visual ball and server authoritative position
  // Increased to 0.3 to allow more natural interpolation curve
  MAX_DEVIATION: 0.3,

  // Collision event window - how long to use faster lerp speed after collision
  // Increased to 150ms for smoother transition
  COLLISION_WINDOW_MS: 150,

  // Legacy constants (kept for compatibility, unused in Approach A)
  COLLISION_EXPIRY_MS: 100,
  MAX_BOUNCE_DURATION_MS: 80,
  SKIP_BOUNCE_THRESHOLD: 0.4,
  HIGH_SPEED_THRESHOLD: 0.7,
} as const;
