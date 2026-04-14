import * as Colyseus from "colyseus.js";
import { SERVER_CONNECTION } from "../config";
import { GameSessionConfig } from "../types/GameSessionConfig";

interface GameState {
  ball: any;
  paddle: any;
  paddle2: any;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  player1Color: string;
  player2Color: string;
  player1Score: number;
  player2Score: number;
  winningScore: number;
  winner: string;
  gameOver: boolean;
  gameStarted: boolean;
  player2Joined: boolean;
}

export interface RoomManagerCallbacks {
  onPlayerAssignment?: (params: {
    isPlayer2: boolean;
    player1Id: string;
    player2Id: string;
  }) => void;
  onPlayerColorUpdate?: (params: {
    p1Color: string;
    p2Color: string;
    isPlayer2: boolean;
  }) => void;
  onBallUpdate?: (params: {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    enabled: boolean;
  }) => void;
  onBallCollision?: (params: {
    lastImpactX: number;
    lastImpactZ: number;
    collisionTime: number;
  }) => void;
  onPaddleUpdate?: (params: {
    paddleIndex: 1 | 2;
    x: number;
    z: number;
    enabled: boolean;
  }) => void;
  onScoreUpdate?: (params: {
    player1Score: number;
    player2Score: number;
  }) => void;
  onGameOver?: (params: {
    winner: string;
    player1Name: string;
    player2Name: string;
    player1Score: number;
    player2Score: number;
  }) => void;
  onPlayerNameUpdate?: (params: {
    player1Name: string;
    player2Name: string;
  }) => void;
  onGameStarted?: () => void;
  onRoomExpired?: () => void;
  onError?: (error: Error) => void;
}
export class RoomManager {
  private _room: Colyseus.Room<GameState> | null = null;
  private _callbacks: RoomManagerCallbacks;
  private _gameMode: string = "";
  private _playerConfig: {
    playerName: string;
    player2Name: string;
    playerColor: string;
    player2Color: string;
  } | null = null;
  private _isPlayer2: boolean = false;
  get isOnlineMode(): boolean {
    return (
      this._gameMode === "online-create" || this._gameMode === "online-join"
    );
  }
  get sessionId(): string | undefined {
    return this._room?.sessionId;
  }
  get room(): Colyseus.Room<GameState> | null {
    return this._room;
  }
  get isPlayer2(): boolean {
    return this._isPlayer2;
  }
  constructor(callbacks: RoomManagerCallbacks) {
    this._callbacks = callbacks;
  }
  async connect(
    gameMode: string,
    config: GameSessionConfig,
    roomId?: string,
  ): Promise<Colyseus.Room<GameState>> {
    this._gameMode = gameMode;
    this._playerConfig = {
      playerName: config.playerName || "Player 1",
      player2Name: config.player2Name || "Player 2",
      playerColor: config.playerColor || "#00A6ED",
      player2Color: config.player2Color || "#F6511D",
    };
    const client = new Colyseus.Client(SERVER_CONNECTION.WS_URL);
    const joinOptions = {
      playerName: this._playerConfig.playerName,
      player2Name: this._playerConfig.player2Name,
      playerColor: this._playerConfig.playerColor,
      player2Color: this._playerConfig.player2Color,
      winningScore: config.winningScore,
      playerId: config.playerId,
      player2Id: config.player2Id,
    };
    let room: Colyseus.Room<GameState>;
    switch (gameMode) {
      case "online-join":
        if (!roomId) throw new Error("roomId required for online-join mode");
        room = await client.joinById<GameState>(roomId, {
          playerName: this._playerConfig.playerName,
          playerColor: this._playerConfig.playerColor,
          winningScore: config.winningScore,
          playerId: config.playerId,
        });
        break;
      case "online-create":
        room = await client.create<GameState>(
          SERVER_CONNECTION.ROOMS.PVP_ROOM,
          {
            playerName: this._playerConfig.playerName,
            playerColor: this._playerConfig.playerColor,
            winningScore: config.winningScore,
            playerId: config.playerId,
          },
        );
        break;
      case "local-2p":
        room = await client.create<GameState>(
          SERVER_CONNECTION.ROOMS.GAME_ROOM,
          joinOptions,
        );
        break;
      case "ai-easy":
      case "ai-medium":
      case "ai-hard":
        room = await client.create<GameState>(
          SERVER_CONNECTION.ROOMS.AI_GAME_ROOM,
          {
            ...joinOptions,
            difficulty: gameMode.replace("ai-", ""),
          },
        );
        break;
      default:
        room = await client.create<GameState>(
          SERVER_CONNECTION.ROOMS.AI_GAME_ROOM,
          {
            ...joinOptions,
            difficulty: "easy",
          },
        );
    }
    this._room = room;
    this.setupStateListeners();
    return room;
  }
  private setupStateListeners(): void {
    const room = this._room!;
    if (room.state.player1Id || room.state.player2Id) {
      this.notifyPlayerAssignment();
    }
    // Safety net: re-check assignment after a short delay in case Colyseus
    // state was already populated before .listen() callbacks were registered.
    setTimeout(() => {
      if (
        room.state.player2Id &&
        room.sessionId === room.state.player2Id &&
        !this._isPlayer2
      ) {
        this.notifyPlayerAssignment();
      }
    }, 200);
    ["player2Id", "player1Id"].forEach((prop) =>
      (room.state as any).listen(prop, () => {
        this.notifyPlayerAssignment();
        this.notifyPlayerColorUpdate();
      }),
    );
    ["player1Color", "player2Color"].forEach((prop) =>
      (room.state as any).listen(prop, () => this.notifyPlayerColorUpdate()),
    );
    (room.state as any).listen("player2Joined", () => {
      this.notifyPlayerAssignment();
      this.notifyPlayerColorUpdate();
    });
    (room.state as any).listen("player2Name", () =>
      this.notifyPlayerNameUpdate(),
    );
    (room.state as any).listen("gameStarted", (value: boolean) => {
      if (value === true) {
        this._callbacks.onGameStarted?.();
      }
    });
    room.state.ball.onChange(() => {
      this._callbacks.onBallUpdate?.({
        x: room.state.ball.x,
        y: room.state.ball.y,
        z: room.state.ball.z,
        vx: room.state.ball.vx,
        vy: room.state.ball.vy,
        vz: room.state.ball.vz,
        enabled: room.state.ball.enabled,
      });
    });
    room.state.ball.listen("collisionCount", () => {
      this._callbacks.onBallCollision?.({
        lastImpactX: room.state.ball.lastImpactX,
        lastImpactZ: room.state.ball.lastImpactZ,
        collisionTime: room.state.ball.collisionTime,
      });
    });
    room.state.paddle.onChange(() => {
      this._callbacks.onPaddleUpdate?.({
        paddleIndex: 1,
        x: room.state.paddle.x,
        z: room.state.paddle.z,
        enabled: room.state.paddle.enabled,
      });
    });
    room.state.paddle2.onChange(() => {
      this._callbacks.onPaddleUpdate?.({
        paddleIndex: 2,
        x: room.state.paddle2.x,
        z: room.state.paddle2.z,
        enabled: room.state.paddle2.enabled,
      });
    });
    (room.state as any).listen("player1Score", () => this.notifyScoreUpdate());
    (room.state as any).listen("player2Score", () => this.notifyScoreUpdate());
    (room.state as any).listen("gameOver", (value: boolean) => {
      if (value) {
        this._callbacks.onGameOver?.({
          winner: room.state.winner,
          player1Name: room.state.player1Name,
          player2Name: room.state.player2Name,
          player1Score: room.state.player1Score,
          player2Score: room.state.player2Score,
        });
      }
    });
    room.onMessage("room_expired", () => {
      this._callbacks.onRoomExpired?.();
    });
  }
  private notifyPlayerAssignment(): void {
    const room = this._room!;
    this._isPlayer2 = room.sessionId === room.state.player2Id;
    this._callbacks.onPlayerAssignment?.({
      isPlayer2: this._isPlayer2,
      player1Id: room.state.player1Id,
      player2Id: room.state.player2Id,
    });
  }
  private notifyPlayerColorUpdate(): void {
    const room = this._room!;
    const isOnlineMode = this.isOnlineMode;
    if (isOnlineMode && !room.state.player2Joined) return;
    this._callbacks.onPlayerColorUpdate?.({
      p1Color: room.state.player1Color || this._playerConfig!.playerColor,
      p2Color: room.state.player2Color || this._playerConfig!.player2Color,
      isPlayer2: this._isPlayer2,
    });
  }
  private notifyPlayerNameUpdate(): void {
    const room = this._room!;
    this._callbacks.onPlayerNameUpdate?.({
      player1Name: room.state.player1Name,
      player2Name: room.state.player2Name,
    });
  }
  private notifyScoreUpdate(): void {
    const room = this._room!;
    this._callbacks.onScoreUpdate?.({
      player1Score: room.state.player1Score,
      player2Score: room.state.player2Score,
    });
  }
  sendInput(input: { paddle1: any; paddle2?: any }): void {
    if (!this._room) return;
    if (this.isOnlineMode) {
      this._room.send("input", input.paddle1);
    } else {
      this._room.send("input", { ...input.paddle1, ...input.paddle2 });
    }
  }
  signalClientReady(): void {
    if (this.isOnlineMode) {
      this._room?.send("client_ready", {});
    }
  }
  sendLaunch(): void {
    this._room?.send("launch", {});
  }
  sendPause(): void {
    this._room?.send("pause", {});
  }
  sendResume(): void {
    this._room?.send("resume", {});
  }
  disconnect(): void {
    this._room?.leave();
    this._room?.removeAllListeners();
    this._room = null;
  }
}
