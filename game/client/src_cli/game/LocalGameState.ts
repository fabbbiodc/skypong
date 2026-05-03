import { Mesh } from "@babylonjs/core";
import { ClientPhysicsEngine } from "../physics/ClientPhysicsEngine";
import { BallBody, PaddleBody } from "../physics/types";
import { ClientAIPaddle, Difficulty } from "./ClientAIPaddle";
import { GMCN, TIMING } from "@skypong/common/constants";
import { GameSessionConfig } from "../types/GameSessionConfig";

/**
 * Callbacks for local game state changes
 */
export interface LocalGameStateCallbacks {
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
}

/**
 * Local game state for AI and local PvP modes
 * Replaces server-side Colyseus room for simplified, client-side games
 */
export class LocalGameState {
  private physicsEngine: ClientPhysicsEngine;
  private aiPaddle: ClientAIPaddle | null = null;

  private ballBody: BallBody;
  private paddle1Body: PaddleBody;
  private paddle2Body: PaddleBody;

  private gameMode: string;
  private winningScore: number = 5;
  private player1Name: string = "Player 1";
  private player2Name: string = "Player 2";
  private player1Color: string = "#00A6ED";
  private player2Color: string = "#F6511D";

  private player1Score: number = 0;
  private player2Score: number = 0;
  private gameStarted: boolean = false;
  private gameOver: boolean = false;
  private winner: string | null = null;

  private isPaused: boolean = false;
  private lastUpdateTime: number = 0;

  private callbacks: LocalGameStateCallbacks;
  private lastBallCollisionTime: number = 0;
  private lastCollisionImpactX: number = 0;
  private lastCollisionImpactZ: number = 0;

  constructor(
    ballMesh: Mesh,
    paddle1Mesh: Mesh,
    paddle2Mesh: Mesh,
    config: GameSessionConfig,
    callbacks: LocalGameStateCallbacks,
  ) {
    this.physicsEngine = new ClientPhysicsEngine();
    this.callbacks = callbacks;

    this.gameMode = config.gameMode;
    this.winningScore = config.winningScore || 5;
    this.player1Name = config.playerName || "Player 1";
    this.player2Name = config.player2Name || "Player 2";
    this.player1Color = config.playerColor || "#00A6ED";
    this.player2Color = config.player2Color || "#F6511D";

    // Create physics bodies
    this.ballBody = this.physicsEngine.createBallBody(
      ballMesh,
      GMCN.TABLE.SIZE.width,
      GMCN.TABLE.SIZE.depth,
    );

    this.paddle1Body = this.physicsEngine.createPaddleBody(paddle1Mesh, false);
    this.paddle2Body = this.physicsEngine.createPaddleBody(paddle2Mesh, true);

    // Create AI if needed
    const isAIMode = this.gameMode.startsWith("ai-");
    if (isAIMode) {
      const difficulty = this._getDifficultyFromMode(this.gameMode);
      this.aiPaddle = new ClientAIPaddle(
        this.paddle2Body,
        this.ballBody,
        this.physicsEngine,
        difficulty,
      );
    }

    // Notify initial setup
    this._notifyPlayerAssignment();
    this._notifyPlayerColorUpdate();
    this._notifyPlayerNameUpdate();
  }

  /**
   * Update game state for one tick
   * Call this from game loop every frame
   */
  public update(deltaTime: number, inputState: InputState): void {
    if (!this.gameStarted || this.gameOver || this.isPaused) {
      return;
    }

    // Update physics for ball
    this.physicsEngine.updateBall(this.ballBody);

    // Update paddles based on input
    this.physicsEngine.movePaddle(this.paddle1Body, inputState.player1Input);

    // Update AI paddle or player 2
    if (this.aiPaddle) {
      this.aiPaddle.update();
    } else {
      this.physicsEngine.movePaddle(this.paddle2Body, inputState.player2Input);
    }

    // Check and resolve collisions
    this._checkAndResolveCollisions();

    // Check for goals
    this._checkForGoals();

    // Clamp ball to table bounds
    this.physicsEngine.clampBallToTable(this.ballBody);

    // Notify listeners of updated state (throttle to avoid spam)
    const now = performance.now();
    if (now - this.lastUpdateTime > 16) {
      // ~60fps update
      this._notifyBallUpdate();
      this._notifyPaddleUpdate(1);
      this._notifyPaddleUpdate(2);
      this.lastUpdateTime = now;
    }
  }

  /**
   * Launch the ball to start game or next rally
   */
  public launch(): void {
    if (!this.gameStarted && !this.gameOver) {
      this.gameStarted = true;
      this._notifyGameStarted();
    }

    this.physicsEngine.launchBall(this.ballBody);
    this._notifyBallUpdate();
  }

  /**
   * Set initial game state
   */
  public setInitialStates(
    ballEnabled: boolean,
    paddle1Enabled: boolean,
    paddle2Enabled: boolean,
  ): void {
    if (ballEnabled) {
      this.physicsEngine.enableBody(this.ballBody);
    } else {
      this.physicsEngine.disableBody(this.ballBody);
    }

    if (paddle1Enabled) {
      this.physicsEngine.enableBody(this.paddle1Body);
    } else {
      this.physicsEngine.disableBody(this.paddle1Body);
    }

    if (paddle2Enabled) {
      this.physicsEngine.enableBody(this.paddle2Body);
    } else {
      this.physicsEngine.disableBody(this.paddle2Body);
    }
  }

  /**
   * Pause the game
   */
  public pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume the game
   */
  public resume(): void {
    this.isPaused = false;
  }

  /**
   * Get current game state (for rendering)
   */
  public getState(): GameStateSnapshot {
    return {
      gameStarted: this.gameStarted,
      gameOver: this.gameOver,
      winner: this.winner,
      player1Score: this.player1Score,
      player2Score: this.player2Score,
      player1Name: this.player1Name,
      player2Name: this.player2Name,
      player1Color: this.player1Color,
      player2Color: this.player2Color,
      ball: {
        enabled: this.ballBody.isEnabled,
        x: this.ballBody.mesh.position.x,
        y: this.ballBody.mesh.position.y,
        z: this.ballBody.mesh.position.z,
        vx: this.ballBody.velocity.x,
        vy: this.ballBody.velocity.y,
        vz: this.ballBody.velocity.z,
      },
      paddle1: {
        enabled: this.paddle1Body.isEnabled,
        x: this.paddle1Body.mesh.position.x,
        z: this.paddle1Body.mesh.position.z,
      },
      paddle2: {
        enabled: this.paddle2Body.isEnabled,
        x: this.paddle2Body.mesh.position.x,
        z: this.paddle2Body.mesh.position.z,
      },
    };
  }

  /**
   * Check and resolve ball collisions
   */
  private _checkAndResolveCollisions(): void {
    // Check border collisions
    const borderCollision = this.physicsEngine.checkBallBorderCollision(
      this.ballBody,
    );
    if (borderCollision.hasCollision) {
      this.physicsEngine.resolveBallBorderCollision(
        this.ballBody,
        borderCollision,
      );
    }

    // Check paddle 1 collision (near paddle, negative Z offset)
    const paddle1Offset =
      -(GMCN.PADDLE.SIZE.depth / 2 + GMCN.BALL.RADIUS);
    const collision1 = this.physicsEngine.checkBallPaddleCollision(
      this.ballBody,
      this.paddle1Body,
      paddle1Offset,
    );
    if (collision1.hasCollision) {
      this.physicsEngine.resolveBallPaddleCollision(
        this.ballBody,
        this.paddle1Body,
        collision1.impactX,
      );
      this._recordCollisionImpact(collision1.impactX, collision1.impactZ);
      this._notifyBallCollision();
    }

    // Check paddle 2 collision (far paddle, positive Z offset)
    const paddle2Offset = GMCN.PADDLE.SIZE.depth / 2 + GMCN.BALL.RADIUS;
    const collision2 = this.physicsEngine.checkBallPaddleCollision(
      this.ballBody,
      this.paddle2Body,
      paddle2Offset,
    );
    if (collision2.hasCollision) {
      this.physicsEngine.resolveBallPaddleCollision(
        this.ballBody,
        this.paddle2Body,
        collision2.impactX,
      );
      this._recordCollisionImpact(collision2.impactX, collision2.impactZ);
      this._notifyBallCollision();
    }
  }

  /**
   * Check if a goal has been scored
   */
  private _checkForGoals(): void {
    if (!this.ballBody.isInFall) return;

    // Determine which player scored
    let scorerIndex: 1 | 2;
    if (this.ballBody.mesh.position.z > 0) {
      // Ball in positive Z - player 1 scored
      scorerIndex = 1;
    } else {
      // Ball in negative Z - player 2 scored
      scorerIndex = 2;
    }

    if (scorerIndex === 1) {
      this.player1Score++;
    } else {
      this.player2Score++;
    }

    this._notifyScoreUpdate();

    // Check for game over
    if (this.player1Score >= this.winningScore) {
      this._endGame(this.player1Name);
    } else if (this.player2Score >= this.winningScore) {
      this._endGame(this.player2Name);
    } else {
      // Reset for next rally
      this._resetRally();
    }
  }

/**
    * Reset ball for next rally
    */
  private _resetRally(): void {
    this.physicsEngine.respawnBallAtCenter(this.ballBody);
    // Launch the ball again after a short delay
    setTimeout(() => {
      this.physicsEngine.launchBall(this.ballBody);
      this._notifyBallUpdate();
    }, 1000);
    if (this.aiPaddle) {
      this.aiPaddle.partialReset();
    }
  }

  /**
   * End the game with a winner
   */
  private _endGame(winner: string): void {
    this.gameOver = true;
    this.winner = winner;
    this.gameStarted = false;
    this.physicsEngine.disableBody(this.ballBody);

    this._notifyGameOver();
  }

  /**
   * Get AI difficulty from game mode string
   */
  private _getDifficultyFromMode(gameMode: string): Difficulty {
    if (gameMode === "ai-easy") return Difficulty.EASY;
    if (gameMode === "ai-medium") return Difficulty.MEDIUM;
    if (gameMode === "ai-hard") return Difficulty.HARD;
    return Difficulty.MEDIUM;
  }

  /**
   * Record collision impact location
   */
  private _recordCollisionImpact(x: number, z: number): void {
    this.lastBallCollisionTime = performance.now();
    this.lastCollisionImpactX = x;
    this.lastCollisionImpactZ = z;
  }

  // Notification methods
  private _notifyPlayerAssignment(): void {
    if (this.callbacks.onPlayerAssignment) {
      this.callbacks.onPlayerAssignment({
        isPlayer2: false,
        player1Id: "local-p1",
        player2Id: "local-p2",
      });
    }
  }

  private _notifyPlayerColorUpdate(): void {
    if (this.callbacks.onPlayerColorUpdate) {
      this.callbacks.onPlayerColorUpdate({
        p1Color: this.player1Color,
        p2Color: this.player2Color,
        isPlayer2: false,
      });
    }
  }

  private _notifyPlayerNameUpdate(): void {
    if (this.callbacks.onPlayerNameUpdate) {
      this.callbacks.onPlayerNameUpdate({
        player1Name: this.player1Name,
        player2Name: this.player2Name,
      });
    }
  }

  private _notifyBallUpdate(): void {
    if (this.callbacks.onBallUpdate) {
      this.callbacks.onBallUpdate({
        x: this.ballBody.mesh.position.x,
        y: this.ballBody.mesh.position.y,
        z: this.ballBody.mesh.position.z,
        vx: this.ballBody.velocity.x,
        vy: this.ballBody.velocity.y,
        vz: this.ballBody.velocity.z,
        enabled: this.ballBody.isEnabled,
      });
    }
  }

  private _notifyBallCollision(): void {
    if (this.callbacks.onBallCollision) {
      this.callbacks.onBallCollision({
        lastImpactX: this.lastCollisionImpactX,
        lastImpactZ: this.lastCollisionImpactZ,
        collisionTime: this.lastBallCollisionTime,
      });
    }
  }

  private _notifyPaddleUpdate(paddleIndex: 1 | 2): void {
    if (this.callbacks.onPaddleUpdate) {
      const paddle = paddleIndex === 1 ? this.paddle1Body : this.paddle2Body;
      this.callbacks.onPaddleUpdate({
        paddleIndex,
        x: paddle.mesh.position.x,
        z: paddle.mesh.position.z,
        enabled: paddle.isEnabled,
      });
    }
  }

  private _notifyScoreUpdate(): void {
    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({
        player1Score: this.player1Score,
        player2Score: this.player2Score,
      });
    }
  }

  private _notifyGameOver(): void {
    if (this.callbacks.onGameOver && this.winner) {
      this.callbacks.onGameOver({
        winner: this.winner,
        player1Name: this.player1Name,
        player2Name: this.player2Name,
        player1Score: this.player1Score,
        player2Score: this.player2Score,
      });
    }
  }

  private _notifyGameStarted(): void {
    if (this.callbacks.onGameStarted) {
      this.callbacks.onGameStarted();
    }
  }
}

/**
 * Input state for the current frame
 */
export interface InputState {
  player1Input: number; // -1, 0, or 1 for paddle direction
  player2Input: number; // -1, 0, or 1 for paddle direction
}

/**
 * Snapshot of current game state (for rendering)
 */
export interface GameStateSnapshot {
  gameStarted: boolean;
  gameOver: boolean;
  winner: string | null;
  player1Score: number;
  player2Score: number;
  player1Name: string;
  player2Name: string;
  player1Color: string;
  player2Color: string;
  ball: {
    enabled: boolean;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
  };
  paddle1: {
    enabled: boolean;
    x: number;
    z: number;
  };
  paddle2: {
    enabled: boolean;
    x: number;
    z: number;
  };
}
