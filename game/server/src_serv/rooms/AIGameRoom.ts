import { Room, Client } from "colyseus";
import { NullEngine, Scene, Vector3, UniversalCamera } from "@babylonjs/core";
import { MyGameState } from "@skypong/common/GameState";
import { ServerBall } from "../entities/ServerBall";
import { ServerPaddle } from "../entities/ServerPaddle";
import { ServerTable } from "../entities/ServerTable";
import { InputManager } from "../input/InputManager";
import { PhysicsEngine } from "../physics";
import { AIPaddleController, Difficulty } from "../ai/AIPaddleController";
import { GameStats } from "../data/GameStats";
import { SERVER_CONFIG, ROOM_CONFIG, Logger } from "../config";

/**
 * Game room for single-player mode with AI opponent
 * AI controls paddle 2 (far end), player controls paddle 1 (near end)
 */
export class AIGameRoom extends Room<MyGameState> {
  public engine!: NullEngine;
  public scene!: Scene;
  public serverBall!: ServerBall;
  public serverPaddle!: ServerPaddle; // Player paddle
  public serverPaddle2!: ServerPaddle; // AI paddle
  public serverTable!: ServerTable;
  public inputManager!: InputManager;
  public physicsEngine!: PhysicsEngine;
  public aiController!: AIPaddleController;

  private difficulty: Difficulty = Difficulty.MEDIUM;
  private hadPaddleCollision: boolean = false;
  private hadPaddle2Collision: boolean = false;
  private lastBorderDirection: number = 0;
  private paddleFrontZOffset: number = ROOM_CONFIG.PADDLE_FRONT_OFFSET;
  private ballLaunched: boolean = false;
  private goalScoredThisRound: boolean = false;
  private playerClient: Client | null = null;
  private isDisposed: boolean = false;
  private startAt: string | null = null;
  private endAt: string | null = null;
  private gameStats: GameStats | null = null;
  private loggedIn: boolean = false;

  onCreate(options: any): void | Promise<any> {
    // Set difficulty from options, default to medium
    if (
      options.difficulty &&
      Object.values(Difficulty).includes(options.difficulty)
    ) {
      this.difficulty = options.difficulty;
    }

    this.setState(new MyGameState());
    if (options.winningScore) {
      this.state.winningScore = options.winningScore;
    }
    this.engine = new NullEngine();
    this.scene = new Scene(this.engine);
    this.physicsEngine = new PhysicsEngine(this.scene);
    this.startAt = new Date().toISOString();
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

    const camera = new UniversalCamera(
      "serverCamera",
      new Vector3(0, 0, 0),
      this.scene,
    );

    this.serverTable = new ServerTable(this.scene);
    this.serverBall = new ServerBall(this.scene, this.physicsEngine);
    this.serverPaddle = new ServerPaddle(this.scene, this.physicsEngine, false); // Player paddle
    this.serverPaddle2 = new ServerPaddle(this.scene, this.physicsEngine, true); // AI paddle
    this.inputManager = new InputManager();

    // Create AI controller for paddle 2
    this.aiController = new AIPaddleController(
      this.serverPaddle2,
      this.serverBall,
      this.physicsEngine,
      this.difficulty,
    );

    // Do NOT launch ball immediately - wait for client "launch" message
    this.ballLaunched = false;

    // Auto-dispose room when all clients leave (fresh start on refresh)
    this.autoDispose = true;

    // Handle player input (only for paddle 1)
    this.onMessage("input", (client, data) => {
      // Reject inputs if game is over
      if (this.state.gameOver) {
        return;
      }
      this.inputManager.setInput(client.sessionId, data);
    });

    // Handle launch message from client (when countdown completes)
    this.onMessage("launch", (client, data) => {
      if (!this.ballLaunched) {
        this.serverBall.launch(this.physicsEngine);
        this.ballLaunched = true;
        this.goalScoredThisRound = false; // Reset goal flag on new launch
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
    // Skip updates if game is over or player has left
    if (this.state.gameOver || this.isDisposed || !this.playerClient || this.state.isPaused) {
      return;
    }

    // Player paddle 1 - controlled by input
    const moveVector = this.inputManager.getMovementVector();
    if (moveVector.x !== 0) {
      const direction = moveVector.x > 0 ? 1 : -1;
      this.serverPaddle.move(direction, this.physicsEngine);
    }

    // AI paddle 2 - controlled by AI controller
    this.aiController.update();

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
      this.physicsEngine.resolveBallPaddleCollision(
        this.serverBall.physicsBody,
        this.serverPaddle.physicsBody,
        collision1.impactX,
      );
      this.state.ball.lastImpactX = collision1.impactX;
      this.state.ball.lastImpactZ = collision1.impactZ;
      this.state.ball.collisionCount++;
      this.state.ball.collisionTime = Date.now();
    }

    if (collision2.hasCollision && !this.hadPaddle2Collision) {
      this.physicsEngine.resolveBallPaddleCollision(
        this.serverBall.physicsBody,
        this.serverPaddle2.physicsBody,
        collision2.impactX,
      );
      this.state.ball.lastImpactX = collision2.impactX;
      this.state.ball.lastImpactZ = collision2.impactZ;
      this.state.ball.collisionCount++;
      this.state.ball.collisionTime = Date.now();
    }

    this.hadPaddleCollision = collision1.hasCollision;
    this.hadPaddle2Collision = collision2.hasCollision;

    // Check for goals (ball passed paddle)
    this.checkForGoal();

    // Reset goal flag if ball is back in play (respawned)
    if (
      this.goalScoredThisRound &&
      this.serverBall.isEnabled() &&
      !this.serverBall.isInFall()
    ) {
      const ballZ = this.serverBall.getPosition().z;
      // Ball is back within table bounds
      if (Math.abs(ballZ) < ROOM_CONFIG.GOAL_THRESHOLD) {
        this.goalScoredThisRound = false;
        Logger.debug(
          `[AI] Goal flag reset - ball back in play at z=${ballZ.toFixed(2)}`,
        );
      }
    }

    // Sync state to clients - use actual enabled state from ball
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

    // Debug logging to trace goal detection
    if (Math.abs(ballZ) > 4.5) {
      Logger.debug(
        `[AI] checkForGoal: ballZ=${ballZ.toFixed(2)}, gameOver=${this.state.gameOver}, ballLaunched=${this.ballLaunched}, ballEnabled=${this.serverBall.isEnabled()}, goalScored=${this.goalScoredThisRound}, threshold=${ROOM_CONFIG.GOAL_THRESHOLD}`,
      );
    }

    if (this.state.gameOver || !this.ballLaunched) {
      if (Math.abs(ballZ) > 4.5) {
        Logger.debug(`[AI] Skipping goal check: gameOver or not launched`);
      }
      return;
    }

    // Skip if goal already scored this round (prevents multiple detections)
    if (this.goalScoredThisRound) {
      return;
    }

    // Only detect goal if ball is enabled
    if (!this.serverBall.isEnabled()) {
      if (Math.abs(ballZ) > 4.5) {
        Logger.debug(`[AI] Skipping goal check: ball disabled`);
      }
      return;
    }

    if (ballZ > ROOM_CONFIG.GOAL_THRESHOLD) {
      Logger.goal(
        `[AI] Player scores! ballZ=${ballZ.toFixed(2)} > threshold=${ROOM_CONFIG.GOAL_THRESHOLD}`,
      );
      this.goalScoredThisRound = true;
      this.awardPoint(1);
    } else if (ballZ < -ROOM_CONFIG.GOAL_THRESHOLD) {
      Logger.goal(
        `[AI] AI scores! ballZ=${ballZ.toFixed(2)} < -threshold=${-ROOM_CONFIG.GOAL_THRESHOLD}`,
      );
      this.goalScoredThisRound = true;
      this.awardPoint(2);
    }
  }

  private awardPoint(playerNum: number): void {
    if (playerNum === 1) {
      this.state.player1Score++;
      Logger.info(
        `[AI] Goal! Player scores! Score: ${this.state.player1Score}-${this.state.player2Score}`,
      );
    } else {
      this.state.player2Score++;
      Logger.info(
        `[AI] Goal! AI scores! Score: ${this.state.player1Score}-${this.state.player2Score}`,
      );
    }

    // Partial reset: reaction timer resets, degradation partially carries over
    this.aiController.partialReset();

    this.checkForWinner();

    // Don't reset ball immediately - let it fall naturally
    // The ball will auto-respawn after falling below threshold (y = -5)
    // This preserves the visual effect of the ball falling off the table
  }

  private checkForWinner(): void {
    const winningScore = this.state.winningScore;
    let winnerId: string | null = null;
    let winnerName: string | null = null;

    if (this.state.player1Score >= winningScore) {
      winnerId = this.state.player1Id;
      winnerName = this.state.player1Name;
    } else if (this.state.player2Score >= winningScore) {
      winnerId = this.difficulty;
      winnerName = this.difficulty;
    }

    if (winnerId) {
      this.state.winner = winnerId;
      this.state.gameOver = true;
      this.serverBall.setGameOver(true);
      this.serverBall.setEnabled(false);
      Logger.gameOver(
        `[AI] Winner: ${winnerName} (${this.state.player1Score}-${this.state.player2Score})`,
      );
      if (this.gameStats) {
        this.gameStats.setScore(
          this.state.player1Score,
          this.state.player2Score,
        );
        this.gameStats.setEndAt(new Date().toISOString());
        if (this.loggedIn === true && this.gameStats) {
          Logger.info("[GameStats]", this.gameStats.toPayload());
          this.gameStats.send();
        }
      }
    }
  }

  onJoin(client: Client, options: any): void | Promise<any> {
    // Only allow one player in AI rooms - reject additional connections
    if (this.playerClient) {
      throw new Error("Room is full");
    }
    this.playerClient = client;
    this.state.player1Id = options.playerId || client.sessionId;
    this.state.player1Name = options.playerName || "Player";
    this.state.player1Color = options.playerColor || "#00A6ED";
    this.state.player2Id = "ai";
    this.state.player2Name = options.player2Name || "AI";
    this.state.player2Color = "#666666"; // Fixed gray color for AI
    this.gameStats?.setPlayer1Id(this.state.player1Id || client.sessionId);
    this.gameStats?.setPlayer1Name(this.state.player1Name);
    this.gameStats?.setPlayer2Id("ai-" + this.difficulty);
    this.gameStats?.setPlayer2Name("ai-" + this.difficulty);
    this.loggedIn = !!options.playerId;
    Logger.info(`[LoggedIn] ${this.loggedIn}`)
    this.state.gameStarted = true;
    this.lock(); // Lock room to prevent additional joins
    Logger.info(
      `[AI] Player joined: ${this.state.player1Id} (${this.state.player1Name}, color: ${this.state.player1Color})`,
    );
  }

  onLeave(client: Client, consented: boolean): void | Promise<any> {
    Logger.info(`[AI] Player left: ${client.sessionId}`);
    if (this.playerClient?.sessionId === client.sessionId) {
      this.playerClient = null;
      this.state.player1Id = "";
      this.isDisposed = true;
      if (this.state.gameStarted && !this.state.gameOver) {
        this.state.winner = this.state.player2Id;
        this.state.gameOver = true;
      }
      this.unlock(); // Unlock room to allow proper disposal
    }
  }

  onDispose(): void | Promise<any> {
    Logger.info("[AI] Disposing room");
    this.isDisposed = true;
    this.inputManager.clear();
    this.engine.dispose();
  }
}
