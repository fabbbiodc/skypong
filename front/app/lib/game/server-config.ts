export const SERVER_CONNECTION = {
  HOST:
    typeof window !== "undefined"
      ? window.location.hostname ||
        process.env.NEXT_PUBLIC_GAME_SERVER_HOST ||
        "localhost"
      : process.env.NEXT_PUBLIC_GAME_SERVER_HOST || "localhost",
  PORT: parseInt(process.env.NEXT_PUBLIC_GAME_SERVER_PORT || "2567", 10),
  PROTOCOL:
    (process.env.NEXT_PUBLIC_GAME_SERVER_PROTOCOL as
      | "ws"
      | "wss"
      | undefined) ||
    (typeof window !== "undefined" && window.location.protocol === "https:"
      ? "wss"
      : "ws"),

  USE_NGINX_PROXY: process.env.NEXT_PUBLIC_USE_NGINX_WS_PROXY !== "false",

  get WS_URL() {
    const explicitServerUrl = process.env.NEXT_PUBLIC_GAME_SERVER_URL;
    if (explicitServerUrl) {
      //   console.log("[ServerConfig] Using explicit server URL:", explicitServerUrl);
      return explicitServerUrl;
    }

    const useNginxProxy = typeof window !== "undefined" && this.USE_NGINX_PROXY;

    if (useNginxProxy && typeof window !== "undefined") {
      // Prefer same-origin WS proxy by default for cross-machine compatibility.
      const url = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/`;
      //   console.log("[ServerConfig] Using nginx proxy (same-origin):", url);
      return url;
    }

    // Direct connection fallback (primarily local development).
    const protocol = this.PROTOCOL;
    const host = this.HOST;
    const port = this.PORT;
    let url: string;
    if (port === 443 || port === 80) {
      url = `${protocol}://${host}/`;
    } else {
      url = `${protocol}://${host}:${port}/`;
    }
    // console.log("[ServerConfig] Using direct connection:", url);
    return url;
  },

  ROOMS: {
    GAME_ROOM: "game_room",
    AI_GAME_ROOM: "ai_game_room",
    PVP_ROOM: "pvp_room",
  },
} as const;
