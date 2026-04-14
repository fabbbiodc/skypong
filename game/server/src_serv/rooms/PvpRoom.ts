import { Room, Client } from "colyseus";
import { NullEngine, Scene, Vector3, UniversalCamera } from "@babylonjs/core";
import { MyGameState } from "@skypong/common/GameState";
import { ServerBall } from "../entities/ServerBall";
import { ServerPaddle } from "../entities/ServerPaddle";
import { ServerTable } from "../entities/ServerTable";
import { InputManager } from "../input/InputManager";
import { PhysicsEngine } from "../physics";
import { GameStats } from "../data/GameStats";
import { SERVER_CONFIG, ROOM_CONFIG, SERVER_TIMING, Logger } from "../config";

/** 2-minute room expiration timeout (ms) */
const ROOM_EXPIRATION_MS = 2 * 60 * 1000;

/**
 * Online PvP room for 2 remote players
 * - Max 2 players
 * - 2-minute expiration if second player never joins
 * - Per-session paddle control enforcement
 * - Room metadata exposes player1Name for lobby listing
 */
export class PvpRoom extends Room<MyGameState> {
  public engine!: NullEngine;
  public scene!: Scene;
  public serverBall!: ServerBall;
  public serverPaddle!: ServerPaddle;
  public serverPaddle2!: ServerPaddle;
  public serverTable!: ServerTable;
  public inputManager!: InputManager;
  public physicsEngine!: PhysicsEngine;
  private hadPaddleCollision: boolean = false;
  private hadPaddle2Collision: boolean = false;
  private lastBorderDirection: number = 0;
  private paddleFrontZOffset: number = ROOM_CONFIG.PADDLE_FRONT_OFFSET;
  private ballLaunched: boolean = false;
  private goalScoredThisRound: boolean = false;
  private player1Client: Client | null = null;
  private player2Client: Client | null = null;
  private expirationTimer: ReturnType<typeof setTimeout> | null = null;
  private startAt: string | null = null;
  private endAt: string | null = null;
  private gameStats: GameStats | null = null;

  onCreate(options: any): void | Promise<any> {
    this.maxClients = 2;
    this.startAt = new Date().toISOString();
    this.setState(new MyGameState());
    if (options.winningScore) {
      this.state.winningScore = options.winningScore;
    }
    this.engine = new NullEngine();
    this.scene = new Scene(this.engine);
    this.physicsEngine = new PhysicsEngine(this.scene);
    this.gameStats = new GameStats(
      this.roomId,
      this.startAt,
      "",
      "",
      "",
      "",
      "",
      0,
      0,
    );
    Logger.info("[RoomId]" + this.roomId);

    const camera = new UniversalCamera(
      "serverCamera",
      new Vector3(0, 0, 0),
      this.scene,
    );

    this.serverTable = new ServerTable(this.scene);
    this.serverBall = new ServerBall(this.scene, this.physicsEngine);
    this.serverPaddle = new ServerPaddle(this.scene, this.physicsEngine, false);
    this.serverPaddle2 = new ServerPaddle(this.scene, this.physicsEngine, true);
    this.inputManager = new InputManager();

    // Do NOT launch ball immediately - wait for client "launch" message
    this.ballLaunched = false;

    // Auto-dispose room when all clients leave
    this.autoDispose = true;

    // Set room metadata for lobby listing
    this.setMetadata({
      player1Name: options.playerName || "Player 1",
      player1Color: options.playerColor || "#00A6ED",
      waitingForOpponent: true,
    });

    // Start 2-minute expiration timer
    this.expirationTimer = setTimeout(() => {
      if (!this.player2Client) {
        Logger.info(
          `[PvP] Room expired — no opponent joined within ${ROOM_EXPIRATION_MS / 1000}s`,
        );
        // Notify player 1 that the room expired
        if (this.player1Client) {
          this.player1Client.send("room_expired", {
            message: "No opponent joined. Returning to menu.",
          });
        }
        // Give client a moment to process the message before disconnecting
        setTimeout(() => {
          this.disconnect().catch(() => {});
        }, 500);
      }
    }, ROOM_EXPIRATION_MS);

    // Handle input — enforce per-session paddle control
    this.onMessage("input", (client, data) => {
      if (this.state.gameOver) {
        return;
      }
      // Only accept input and tag it with which player this client is
      if (client.sessionId === this.player1Client?.sessionId) {
        this.inputManager.setInput(client.sessionId, {
          ...data,
          _playerNum: 1,
        });
      } else if (client.sessionId === this.player2Client?.sessionId) {
        this.inputManager.setInput(client.sessionId, {
          ...data,
          _playerNum: 2,
        });
      }
      // Ignore input from unknown clients
    });

    // Handle client ready message (when assets are loaded)
    this.onMessage("client_ready", (client, data) => {
      Logger.info(`[PvP] Client ready: ${client.sessionId}`);

      // Mark the appropriate player as ready
      if (client.sessionId === this.player1Client?.sessionId) {
        this.state.player1Ready = true;
      } else if (client.sessionId === this.player2Client?.sessionId) {
        this.state.player2Ready = true;
      }

      // Check if both clients are ready
      if (
        this.state.player1Ready &&
        this.state.player2Ready &&
        !this.state.gameStarted
      ) {
        Logger.info("[PvP] Both clients ready, starting game");
        this.state.gameStarted = true;
      }
    });

    // Handle launch message from client (when countdown completes)
    this.onMessage("launch", (client, data) => {
      // Only allow launch when BOTH players have joined
      if (!this.player1Client || !this.player2Client) {
        Logger.info("[PvP] Launch ignored - waiting for both players");
        return;
      }

      if (!this.ballLaunched) {
        this.serverBall.launch(this.physicsEngine);
        this.ballLaunched = true;
        this.goalScoredThisRound = false;
      }
    });

    // Handle pause/resume from client
    this.onMessage("pause", (client, data) => {
      this.state.isPaused = true;
    });
    this.onMessage("resume", (client, data) => {
      this.state.isPaused = false;
    });

    this.setSimulationInterval((deltaTime) => {
      this.update(deltaTime);
    }, SERVER_CONFIG.SIMULATION_INTERVAL_MS);
  }

  update(deltaTime: number) {
    // Skip updates if game is over or paused
    if (this.state.gameOver || this.state.isPaused) {
      return;
    }

    // Process paddle1 input (only from player 1's tagged input)
    // Process paddle2 input (only from player 2's tagged input)
    const allInputs = this.inputManager.getAllInputs();
    let paddle1Direction = 0;
    let paddle2Direction = 0;

    for (const sessionId in allInputs) {
      const inputs = allInputs[sessionId];
      if (inputs._playerNum === 1) {
        // Player 1 controls paddle1 with A/D keys
        if (inputs["a"]) paddle1Direction -= 1;
        if (inputs["d"]) paddle1Direction += 1;
      } else if (inputs._playerNum === 2) {
        // Player 2 controls paddle2 with A/D keys (same keys, different paddle)
        // Invert controls for player 2 (mirrored view)
        if (inputs["a"]) paddle2Direction += 1;
        if (inputs["d"]) paddle2Direction -= 1;
      }
    }

    if (paddle1Direction !== 0) {
      this.serverPaddle.move(paddle1Direction, this.physicsEngine);
    }

    if (paddle2Direction !== 0) {
      this.serverPaddle2.move(paddle2Direction, this.physicsEngine);
    }

    this.serverBall.update(deltaTime, this.physicsEngine);
    this.physicsEngine.clampBallToTable(this.serverBall.physicsBody);

    const borderCollision = this.physicsEngine.checkBallBorderCollision(
      this.serverBall.physicsBody,
    );

    if (borderCollision.hasCollision && this.lastBorderDirection === 0) {
      this.physicsEngine.resolveBallBorderCollision(
        this.serverBall.physicsBody,
        borderCollision,
      );
      const ballPosition = this.serverBall.getPosition();
      this.state.ball.lastImpactX = borderCollision.collisionX;
      this.state.ball.lastImpactZ = ballPosition.z;
      this.state.ball.collisionCount++;
      this.state.ball.collisionTime = Date.now();
    }

    this.lastBorderDirection = borderCollision.borderDirection;

    const collision1 = this.physicsEngine.checkBallPaddleCollision(
      this.serverBall.physicsBody,
      this.serverPaddle.physicsBody,
      this.paddleFrontZOffset,
    );

    const collision2 = this.physicsEngine.checkBallPaddleCollision(
      this.serverBall.physicsBody,
      this.serverPaddle2.physicsBody,
      -this.paddleFrontZOffset,
    );

    if (collision1.hasCollision && !this.hadPaddleCollision) {
      const ballPosition = this.serverBall.getPosition();
      this.physicsEngine.resolveBallPaddleCollision(
        this.serverBall.physicsBody,
        this.serverPaddle.physicsBody,
        collision1.impactX,
      );
      this.state.ball.lastImpactX = ballPosition.x;
      this.state.ball.lastImpactZ = ballPosition.z;
      this.state.ball.collisionCount++;
      this.state.ball.collisionTime = Date.now();
    }

    if (collision2.hasCollision && !this.hadPaddle2Collision) {
      const ballPosition = this.serverBall.getPosition();
      this.physicsEngine.resolveBallPaddleCollision(
        this.serverBall.physicsBody,
        this.serverPaddle2.physicsBody,
        collision2.impactX,
      );
      this.state.ball.lastImpactX = ballPosition.x;
      this.state.ball.lastImpactZ = ballPosition.z;
      this.state.ball.collisionCount++;
      this.state.ball.collisionTime = Date.now();
    }

    this.hadPaddleCollision = collision1.hasCollision;
    this.hadPaddle2Collision = collision2.hasCollision;

    // Check for goals
    this.checkForGoal();

    // Reset goal flag if ball is back in play
    if (
      this.goalScoredThisRound &&
      this.serverBall.isEnabled() &&
      !this.serverBall.isInFall()
    ) {
      const ballZ = this.serverBall.getPosition().z;
      if (Math.abs(ballZ) < ROOM_CONFIG.GOAL_THRESHOLD) {
        this.goalScoredThisRound = false;
        Logger.debug(
          `[PvP] Goal flag reset - ball back in play at z=${ballZ.toFixed(2)}`,
        );
      }
    }

    // Sync ball state
    this.state.ball.enabled = this.serverBall.isEnabled();
    if (this.state.ball.enabled) {
      const ballPosition = this.serverBall.getPosition();
      this.state.ball.x = ballPosition.x;
      this.state.ball.y = ballPosition.y;
      this.state.ball.z = ballPosition.z;

      // Sync velocity for client-side extrapolation
      const velocity = this.serverBall.physicsBody.velocity;
      this.state.ball.vx = velocity.x;
      this.state.ball.vy = velocity.y;
      this.state.ball.vz = velocity.z;
    }

    this.state.paddle.enabled = this.serverPaddle.isEnabled();
    if (this.state.paddle.enabled) {
      const paddlePosition = this.serverPaddle.getPosition();
      this.state.paddle.x = paddlePosition.x;
      this.state.paddle.z = paddlePosition.z;
    }

    this.state.paddle2.enabled = this.serverPaddle2.isEnabled();
    if (this.state.paddle2.enabled) {
      const paddle2Position = this.serverPaddle2.getPosition();
      this.state.paddle2.x = paddle2Position.x;
      this.state.paddle2.z = paddle2Position.z;
    }
  }

  /**
   * Check if ball passed a paddle (goal scored)
   */
  private checkForGoal(): void {
    const ballZ = this.serverBall.getPosition().z;

    if (Math.abs(ballZ) > 4.5) {
      Logger.debug(
        `[PvP] checkForGoal: ballZ=${ballZ.toFixed(2)}, gameOver=${this.state.gameOver}, ballLaunched=${this.ballLaunched}, ballEnabled=${this.serverBall.isEnabled()}, goalScored=${this.goalScoredThisRound}, threshold=${ROOM_CONFIG.GOAL_THRESHOLD}`,
      );
    }

    if (this.state.gameOver || !this.ballLaunched) {
      return;
    }

    if (this.goalScoredThisRound) {
      return;
    }

    if (!this.serverBall.isEnabled()) {
      return;
    }

    // Ball passed paddle2 (far side) — Player 1 scores
    if (ballZ > ROOM_CONFIG.GOAL_THRESHOLD) {
      Logger.goal(
        `[PvP] Player 1 scores! ballZ=${ballZ.toFixed(2)} > threshold=${ROOM_CONFIG.GOAL_THRESHOLD}`,
      );
      this.goalScoredThisRound = true;
      this.awardPoint(1);
      return;
    }

    // Ball passed paddle1 (near side) — Player 2 scores
    if (ballZ < -ROOM_CONFIG.GOAL_THRESHOLD) {
      Logger.goal(
        `[PvP] Player 2 scores! ballZ=${ballZ.toFixed(2)} < -threshold=${-ROOM_CONFIG.GOAL_THRESHOLD}`,
      );
      this.goalScoredThisRound = true;
      this.awardPoint(2);
      return;
    }
  }

  /**
   * Award a point to the specified player and check for winner
   */
  private awardPoint(playerNum: number): void {
    if (playerNum === 1) {
      this.state.player1Score++;
      Logger.info(
        `[PvP] Goal! ${this.state.player1Name} scores! Score: ${this.state.player1Score}-${this.state.player2Score}`,
      );
    } else {
      this.state.player2Score++;
      Logger.info(
        `[PvP] Goal! ${this.state.player2Name} scores! Score: ${this.state.player1Score}-${this.state.player2Score}`,
      );
    }

    this.checkForWinner();
  }

  /**
   * Check if a player has won the game
   */
  private checkForWinner(): void {
    const winningScore = this.state.winningScore;
    let winnerId: string | null = null;
    let winnerName: string | null = null;

    if (this.state.player1Score >= winningScore) {
      winnerId = this.state.player1Id;
      winnerName = this.state.player1Name;
    } else if (this.state.player2Score >= winningScore) {
      winnerId = this.state.player2Id;
      winnerName = this.state.player2Name;
    }

    if (winnerId) {
      this.state.winner = winnerId;
      this.state.gameOver = true;
      this.serverBall.setGameOver(true);
      this.serverBall.setEnabled(false);
      Logger.gameOver(
        `[PvP] Winner: ${winnerName} (${this.state.player1Score}-${this.state.player2Score})`,
      );
      if (this.gameStats) {
        this.gameStats.setScore(
          this.state.player1Score,
          this.state.player2Score,
        );
        this.gameStats.setEndAt(new Date().toISOString());
        Logger.info("[GameStats]", this.gameStats.toPayload());
        this.gameStats.send(); // ILYA
      }
    }
  }

  onJoin(client: Client, options: any): void | Promise<any> {
    if (!this.player1Client) {
      this.player1Client = client;
      this.state.player1Id = client.sessionId;
      this.state.player1Name = options.playerName || "Player 1";
      this.state.player1Color = options.playerColor || "#00A6ED";
      this.gameStats?.setPlayer1Id(options.playerId || client.sessionId);
      this.gameStats?.setPlayer1Name(this.state.player1Name);
      Logger.info(
        `[PvP] Player 1 joined: ${this.state.player1Id} (${this.state.player1Name}, color: ${this.state.player1Color})`,
      );

      // Update metadata with player color for lobby listing
      this.setMetadata({
        player1Name: this.state.player1Name,
        player1Color: this.state.player1Color,
        waitingForOpponent: true,
      });
    } else if (!this.player2Client) {
      this.player2Client = client;
      this.state.player2Id = client.sessionId;
      this.state.player2Name = options.playerName || "Player 2";
      this.state.player2Color = options.playerColor || "#F6511D";
      this.gameStats?.setPlayer2Id(options.playerId || client.sessionId);
      this.gameStats?.setPlayer2Name(this.state.player2Name);
      Logger.info(
        `[PvP] Player 2 joined: ${this.state.player2Id} (${this.state.player2Name}, color: ${this.state.player2Color})`,
      );

      // Set player2Joined flag so clients know both colors are available
      this.state.player2Joined = true;

      // Cancel expiration timer — opponent joined
      if (this.expirationTimer) {
        clearTimeout(this.expirationTimer);
        this.expirationTimer = null;
      }

      // Lock room — no more players
      this.lock();

      // Update metadata
      this.setMetadata({
        player1Name: this.state.player1Name,
        player1Color: this.state.player1Color,
        waitingForOpponent: false,
      });

      // Don't start game immediately - wait for both clients to signal ready
      // (gameStarted will be set to true when both clients send "client_ready")
    } else {
      throw new Error("Room is full");
    }
  }

  onLeave(client: Client, consented: boolean): void | Promise<any> {
    Logger.info(
      `[PvP] Client left: ${client.sessionId} (consented: ${consented})`,
    );

    if (this.player1Client?.sessionId === client.sessionId) {
      this.player1Client = null;
      this.state.player1Id = "";
      if (this.state.gameStarted && !this.state.gameOver) {
        this.state.winner = this.state.player2Id;
        this.state.gameOver = true;
      }
    } else if (this.player2Client?.sessionId === client.sessionId) {
      this.player2Client = null;
      this.state.player2Id = "";
      if (this.state.gameStarted && !this.state.gameOver) {
        this.state.winner = this.state.player1Id;
        this.state.gameOver = true;
      }
    }

    // If both players have left, dispose the room
    if (!this.player1Client && !this.player2Client) {
      Logger.info(`[PvP] All players left, disposing room`);
      setTimeout(() => {
        this.disconnect().catch(() => {});
      }, ROOM_CONFIG.DISPOSAL_DELAY_MS);
    }
  }

  onDispose(): void | Promise<any> {
    Logger.info("[PvP] Disposing room");
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
    this.inputManager.clear();
    this.engine.dispose();
  }
}
