/**
 * AI difficulty configurations and behavior constants
 * Used by AIPaddleController on the server
 */

export const AI_DIFFICULTY = {
  EASY: {
    REACTION_DELAY_FRAMES: 37,
    MAX_SPEED_MULTIPLIER: 0.55,
    ACCURACY: 0.146,
    PREDICTION_FACTOR: 0.0366,
    ERROR_FREQUENCY: 0.222,
    DEGRADATION_TICK_INTERVAL: 659, // ~11 seconds at 60fps — degrades fastest
  },
  MEDIUM: {
    REACTION_DELAY_FRAMES: 23,
    MAX_SPEED_MULTIPLIER: 0.55,
    ACCURACY: 0.308,
    PREDICTION_FACTOR: 0.077,
    ERROR_FREQUENCY: 0.14,
    DEGRADATION_TICK_INTERVAL: 924, // ~15.4 seconds at 60fps
  },
  HARD: {
    REACTION_DELAY_FRAMES: 14,
    MAX_SPEED_MULTIPLIER: 0.75,
    ACCURACY: 0.508,
    PREDICTION_FACTOR: 0.347,
    ERROR_FREQUENCY: 0.082,
    DEGRADATION_TICK_INTERVAL: 1502, // ~25 seconds at 60fps — degrades slowest
  },
} as const;

export const AI_BEHAVIOR = {
  VELOCITY_FALLBACK: 0.1,
  MOVEMENT_THRESHOLD: 0.1,
  ERROR_MULTIPLIER: 2.0,
  SPEED_CALCULATION: {
    MIN_FACTOR: 0.5,
    MAX_FACTOR: 1.0,
  },
  DEGRADATION: {
    /** Error frequency multiplier increase per degradation level */
    ERROR_FREQ_BOOST_PER_LEVEL: 0.2,
    /** Accuracy reduction per degradation level */
    ACCURACY_PENALTY_PER_LEVEL: 0.05,
    /** How much degradation carries over after a goal (0.5 = keep half) */
    RESET_CARRY_FACTOR: 0.5,
    /** Maximum degradation level cap */
    MAX_LEVEL: 10,
    /** Floor — AI accuracy never drops below this */
    MIN_ACCURACY: 0.1,
  },
} as const;
