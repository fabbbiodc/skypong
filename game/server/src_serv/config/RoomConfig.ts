/**
 * Room configuration
 * Lifecycle and gameplay parameters for game rooms
 */

import { GMCN, SCORING, TIMING } from "@skypong/common/constants";

export const ROOM_CONFIG = {
    GOAL_THRESHOLD: GMCN.TABLE.SIZE.depth / 2 + SCORING.GOAL_THRESHOLD_OFFSET,
    PADDLE_FRONT_OFFSET: GMCN.PADDLE.SIZE.depth / 2 + GMCN.BALL.RADIUS,
    DISPOSAL_DELAY_MS: TIMING.ROOM.DISPOSAL_DELAY_MS,
    /** Ball starts falling after passing this Z threshold (must be >= GOAL_THRESHOLD) */
    FALL_THRESHOLD_Z: GMCN.TABLE.SIZE.depth / 2 + SCORING.GOAL_THRESHOLD_OFFSET,
} as const;
