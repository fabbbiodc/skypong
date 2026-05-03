import { GMCN, AI_DIFFICULTY, AI_BEHAVIOR } from "@skypong/common/constants";
import { BallBody, PaddleBody } from "../physics/types";
import { ClientPhysicsEngine } from "../physics/ClientPhysicsEngine";

/**
 * AI difficulty levels
 */
export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

interface DifficultySettings {
  reactionDelay: number;
  maxSpeed: number;
  accuracy: number;
  predictionFactor: number;
  errorFrequency: number;
  degradationTickInterval: number;
}

const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  [Difficulty.EASY]: {
    reactionDelay: AI_DIFFICULTY.EASY.REACTION_DELAY_FRAMES,
    maxSpeed: AI_DIFFICULTY.EASY.MAX_SPEED_MULTIPLIER,
    accuracy: AI_DIFFICULTY.EASY.ACCURACY,
    predictionFactor: AI_DIFFICULTY.EASY.PREDICTION_FACTOR,
    errorFrequency: AI_DIFFICULTY.EASY.ERROR_FREQUENCY,
    degradationTickInterval: AI_DIFFICULTY.EASY.DEGRADATION_TICK_INTERVAL,
  },
  [Difficulty.MEDIUM]: {
    reactionDelay: AI_DIFFICULTY.MEDIUM.REACTION_DELAY_FRAMES,
    maxSpeed: AI_DIFFICULTY.MEDIUM.MAX_SPEED_MULTIPLIER,
    accuracy: AI_DIFFICULTY.MEDIUM.ACCURACY,
    predictionFactor: AI_DIFFICULTY.MEDIUM.PREDICTION_FACTOR,
    errorFrequency: AI_DIFFICULTY.MEDIUM.ERROR_FREQUENCY,
    degradationTickInterval: AI_DIFFICULTY.MEDIUM.DEGRADATION_TICK_INTERVAL,
  },
  [Difficulty.HARD]: {
    reactionDelay: AI_DIFFICULTY.HARD.REACTION_DELAY_FRAMES,
    maxSpeed: AI_DIFFICULTY.HARD.MAX_SPEED_MULTIPLIER,
    accuracy: AI_DIFFICULTY.HARD.ACCURACY,
    predictionFactor: AI_DIFFICULTY.HARD.PREDICTION_FACTOR,
    errorFrequency: AI_DIFFICULTY.HARD.ERROR_FREQUENCY,
    degradationTickInterval: AI_DIFFICULTY.HARD.DEGRADATION_TICK_INTERVAL,
  },
};

/**
 * Client-side AI controller for opponent paddle in local game
 * Tracks ball position and makes movement decisions
 *
 * Features progressive degradation: the AI gets worse the longer a rally
 * continues, making it easier to score on long rallies.
 */
export class ClientAIPaddle {
  private paddle: PaddleBody;
  private ball: BallBody;
  private physicsEngine: ClientPhysicsEngine;
  private settings: DifficultySettings;
  private difficulty: Difficulty;

  private reactionTimer: number = 0;
  private lastBallX: number = 0;
  private targetX: number = 0;
  private isReacting: boolean = false;
  private lastMoveDirection: number = 0;
  private consecutiveErrors: number = 0;

  // Progressive degradation state
  private rallyTickCount: number = 0;
  private degradationLevel: number = 0;
  private accumulatedDegradation: number = 0;

  constructor(
    paddle: PaddleBody,
    ball: BallBody,
    physicsEngine: ClientPhysicsEngine,
    difficulty: Difficulty = Difficulty.MEDIUM,
  ) {
    this.paddle = paddle;
    this.ball = ball;
    this.physicsEngine = physicsEngine;
    this.difficulty = difficulty;
    this.settings = DIFFICULTY_SETTINGS[difficulty];
  }

  /**
   * Update AI - call this every physics tick
   */
  public update(): void {
    if (!this.ball.isEnabled || !this.paddle.isEnabled) {
      return;
    }

    const ballPos = this.ball.mesh.position;
    const paddlePos = this.paddle.mesh.position;

    // Only react if ball is moving towards AI paddle (positive Z for far paddle)
    if (ballPos.z > 0 && this.ball.velocity.z > 0) {
      this.rallyTickCount++;
      this.updateDegradation();
      this.updateTargeting(ballPos, paddlePos);
    } else {
      // Ball is moving away - return to center slowly
      this.targetX = 0;
      this.isReacting = false;
    }

    // Execute movement
    this.executeMovement(paddlePos.x);
  }

  /**
   * Update degradation level based on rally duration
   */
  private updateDegradation(): void {
    const newLevel = Math.min(
      Math.floor(this.rallyTickCount / this.settings.degradationTickInterval) +
        Math.floor(this.accumulatedDegradation),
      AI_BEHAVIOR.DEGRADATION.MAX_LEVEL,
    );
    this.degradationLevel = newLevel;
  }

  /**
   * Get effective accuracy with degradation applied
   */
  private getEffectiveAccuracy(): number {
    const degraded =
      this.settings.accuracy -
      this.degradationLevel *
        AI_BEHAVIOR.DEGRADATION.ACCURACY_PENALTY_PER_LEVEL;
    return Math.max(
      AI_BEHAVIOR.DEGRADATION.MIN_ACCURACY,
      Math.min(this.settings.accuracy, degraded),
    );
  }

  /**
   * Get effective error frequency with degradation applied
   */
  private getEffectiveErrorFrequency(): number {
    const degraded =
      this.settings.errorFrequency *
      (1 +
        this.degradationLevel *
          AI_BEHAVIOR.DEGRADATION.ERROR_FREQ_BOOST_PER_LEVEL);
    return Math.max(this.settings.errorFrequency, degraded);
  }

  /**
   * Calculate where AI should move based on ball position and velocity
   */
  private updateTargeting(
    ballPos: { x: number; y: number; z: number },
    paddlePos: { x: number; y: number; z: number },
  ): void {
    // Handle reaction delay
    if (this.reactionTimer < this.settings.reactionDelay) {
      this.reactionTimer++;
      return;
    }

    // Calculate predicted ball X based on velocity and prediction factor
    const ballVelocity = this.ball.velocity;
    const distanceToPaddle = Math.abs(paddlePos.z - ballPos.z);
    const timeToReach =
      distanceToPaddle /
      (Math.abs(ballVelocity.z) || AI_BEHAVIOR.VELOCITY_FALLBACK);

    // Predict where ball will be when it reaches paddle Z
    let predictedX =
      ballPos.x + ballVelocity.x * timeToReach * this.settings.predictionFactor;

    // Clamp prediction to table bounds
    const tableHalfWidth = GMCN.TABLE.SIZE.width / 2;
    predictedX = Math.max(
      -tableHalfWidth,
      Math.min(tableHalfWidth, predictedX),
    );

    // Apply accuracy with degradation
    const effectiveAccuracy = this.getEffectiveAccuracy();
    const currentX = paddlePos.x;
    const idealX = predictedX;
    const errorFactor = 1 - effectiveAccuracy;
    this.targetX = idealX + (currentX - idealX) * errorFactor;

    // Check for random error with degradation-boosted frequency
    const effectiveErrorFreq = this.getEffectiveErrorFrequency();
    if (Math.random() < effectiveErrorFreq) {
      this.consecutiveErrors++;
      const errorAmount =
        (Math.random() - 0.5) *
        AI_BEHAVIOR.ERROR_MULTIPLIER *
        this.consecutiveErrors;
      this.targetX += errorAmount;
    } else {
      this.consecutiveErrors = Math.max(0, this.consecutiveErrors - 1);
    }

    this.isReacting = true;
    this.lastBallX = ballPos.x;
  }

  /**
   * Execute movement toward target
   */
  private executeMovement(currentX: number): void {
    const diff = this.targetX - currentX;
    const absDiff = Math.abs(diff);

    if (absDiff < AI_BEHAVIOR.MOVEMENT_THRESHOLD) {
      this.lastMoveDirection = 0;
      return;
    }

    const direction = diff > 0 ? 1 : -1;
    const distanceFactor = Math.min(absDiff / 2, 1);
    const speedMultiplier =
      this.settings.maxSpeed *
      (AI_BEHAVIOR.SPEED_CALCULATION.MIN_FACTOR +
        distanceFactor * AI_BEHAVIOR.SPEED_CALCULATION.MAX_FACTOR);

    this.lastMoveDirection = direction * speedMultiplier;
    this.physicsEngine.movePaddle(this.paddle, this.lastMoveDirection);
  }

  /**
   * Get current difficulty
   */
  public getDifficulty(): Difficulty {
    return this.difficulty;
  }

  /**
   * Change difficulty mid-game
   */
  public setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
    this.settings = DIFFICULTY_SETTINGS[difficulty];
    this.reactionTimer = 0;
  }

  /**
   * Partial reset after a goal is scored
   */
  public partialReset(): void {
    this.reactionTimer = 0;
    this.targetX = 0;
    this.isReacting = false;
    this.lastBallX = 0;
    this.lastMoveDirection = 0;
    this.consecutiveErrors = 0;
    this.rallyTickCount = 0;

    const totalDegradation =
      this.accumulatedDegradation + this.degradationLevel;
    this.accumulatedDegradation = Math.max(
      0,
      totalDegradation * AI_BEHAVIOR.DEGRADATION.RESET_CARRY_FACTOR,
    );
    this.degradationLevel = Math.max(
      0,
      Math.floor(this.accumulatedDegradation),
    );
  }

  /**
   * Full reset of AI state
   */
  public reset(): void {
    this.reactionTimer = 0;
    this.targetX = 0;
    this.isReacting = false;
    this.lastBallX = 0;
    this.lastMoveDirection = 0;
    this.consecutiveErrors = 0;
    this.rallyTickCount = 0;
    this.degradationLevel = 0;
    this.accumulatedDegradation = 0;
  }
}
