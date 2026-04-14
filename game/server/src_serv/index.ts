import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { GameRoom } from "./rooms/GameRoom";
import { AIGameRoom } from "./rooms/AIGameRoom";
import { PvpRoom } from "./rooms/PvpRoom";
import { SERVER_CONFIG, Logger } from "./config";

const app = express();

app.use(cors({
    origin: '*', // Allow all origins for testing. Restrict for production!
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
}));
app.use(express.json());

app.get("/healthz", (_req, res) => {
    res.status(200).json({ ok: true, service: "game-service" });
});

const gameServer = new Server({
    transport: new WebSocketTransport({
        server: createServer(app),
    }),
});

// Two-player local multiplayer
gameServer.define("game_room", GameRoom);

// Single-player vs AI with difficulty options
gameServer.define("ai_game_room", AIGameRoom);

// Online PvP with room-based matchmaking
gameServer.define("pvp_room", PvpRoom)
    .enableRealtimeListing();

gameServer.listen(SERVER_CONFIG.PORT, "0.0.0.0");
Logger.info(`Listening on ws://0.0.0.0:${SERVER_CONFIG.PORT}`);
Logger.info(`Available rooms:`);
Logger.info(`  - game_room: Two-player local multiplayer`);
Logger.info(`  - ai_game_room: Single-player vs AI (options: { difficulty: 'easy' | 'medium' | 'hard' })`);
Logger.info(`  - pvp_room: Online PvP with room-based matchmaking`);
