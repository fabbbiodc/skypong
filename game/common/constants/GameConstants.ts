/**
 * Unified game configuration shared across the project
 * These values should be used consistently in both client and server
 */
export const GMCN = {
  // INFO GMCN = Game Constants
  // ==================== DIMENSIONS ====================
  TABLE: {
    SIZE: { width: 5, depth: 10, height: 0.5 },
    Y_POSITION: 0,
  },
  BALL: {
    DIAMETER: 0.4,
    RADIUS: 0.2,
  },
  GROUND: {
    WIDTH: 10,
    LENGTH: 15,
  },

  // ==================== PHYSICS ====================
  PHYSICS: {
    /** Ball movement speed */
    BALL_MOVE_SPEED: 0.02,
    SERVE_VELOCITY_Z: 0.05,
  },
  PADDLE: {
    SIZE: { width: 2, depth: 0.2, height: 0.2 },
    SPEED: 0.2,
  },
  BORDERS: {
    // Invisible walls on the long sides (left and right)
    // Exact table edge positions (table width 5 / 2 = 2.5)
    LEFT_EDGE: -2.5,
    RIGHT_EDGE: 2.5,
  },
};
