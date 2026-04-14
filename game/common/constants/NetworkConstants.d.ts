/**
 * Network and synchronization configuration
 * Used by both client and server for connection and room management
 */
export declare const NETWORK: {
  readonly SERVER: {
    readonly PORT: 2567;
    readonly HOST: "localhost";
    /** Computed WebSocket URL - use in client connection */
    readonly WS_URL: string;
  };
  readonly ROOMS: {
    /** Two-player local multiplayer room */
    readonly GAME_ROOM: "game_room";
    /** Single-player vs AI room */
    readonly AI_GAME_ROOM: "ai_game_room";
    /** Online PvP with room-based matchmaking */
    readonly PVP_ROOM: "pvp_room";
  };
  readonly SYNC: {
    /** Server simulation runs at 60 FPS (16.66ms per frame) */
    readonly SIMULATION_INTERVAL_MS: 16.66;
    /** Client sends input every N frames to reduce network overhead */
    readonly INPUT_SEND_INTERVAL_FRAMES: 3;
    /** Speed updates sent to clients every N frames */
    readonly SPEED_UPDATE_INTERVAL_FRAMES: 5;
  };
};
