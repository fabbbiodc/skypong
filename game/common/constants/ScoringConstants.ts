/**
 * Scoring and game rules constants
 * Used by both client and server for game flow
 */

export const SCORING = {
    /** Default winning score for a match */
    DEFAULT_WINNING_SCORE: 2,
    
    /** How far past table edge before goal is detected */
    GOAL_THRESHOLD_OFFSET: 0.5,
} as const;
