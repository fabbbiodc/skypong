/**
 * Network and synchronization configuration
 * Used by both client and server for connection and room management
 */

export const NETWORK = {
  SERVER: {
    PORT: 2567,
    HOST: "localhost",
    /** Computed WebSocket URL - use in client connection */
    get WS_URL(): string {
      return `ws://${this.HOST}:${this.PORT}`;
    },
  },
  ROOMS: {
    /** Two-player local multiplayer room */
    GAME_ROOM: "game_room",
    /** Single-player vs AI room */
    AI_GAME_ROOM: "ai_game_room",
    /** Online PvP with room-based matchmaking */
    PVP_ROOM: "pvp_room",
  },
  SYNC: {
    /** Server simulation runs at 60 FPS (16.66ms per frame) */
    SIMULATION_INTERVAL_MS: 16.66,

    /** Client sends input every N frames to reduce network overhead */
    INPUT_SEND_INTERVAL_FRAMES: 3,

    /** Speed updates sent to clients every N frames */
    SPEED_UPDATE_INTERVAL_FRAMES: 5,
  },
} as const;
