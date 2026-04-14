/**
 * Server connection configuration
 * Environment-aware settings for connecting to the game server
 * 
 * To override defaults, set environment variables:
 * - VITE_SERVER_HOST (default: localhost)
 * - VITE_SERVER_PORT (default: 2567)
 * - VITE_WS_PROTOCOL (default: ws)
 * - VITE_SERVER_PATH (default: /)
 */

export const SERVER_CONNECTION = {
    HOST: import.meta.env.VITE_SERVER_HOST || 'localhost',
    PORT: import.meta.env.VITE_SERVER_PORT || 2567,
    PROTOCOL: import.meta.env.VITE_WS_PROTOCOL || 'ws',
    PATH: import.meta.env.VITE_SERVER_PATH || '/',

    get WS_URL() {
        // Don't include port for standard HTTPS/WSS (443) or HTTP/WS (80)
        const port = this.PORT;
        const normalizedPath = this.PATH.startsWith('/') ? this.PATH : `/${this.PATH}`;
        if (port === 443 || port === '443' || port === 80 || port === '80') {
            return `${this.PROTOCOL}://${this.HOST}${normalizedPath}`;
        }
        return `${this.PROTOCOL}://${this.HOST}:${this.PORT}${normalizedPath}`;
    },
    
    ROOMS: {
        GAME_ROOM: 'game_room',
        AI_GAME_ROOM: 'ai_game_room',
        PVP_ROOM: 'pvp_room',
    },
} as const;
