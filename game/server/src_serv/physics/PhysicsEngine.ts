import { Vector3, Mesh, Scene } from "@babylonjs/core";
import { PHYSICS, GMCN } from "@skypong/common/constants";
import { ROOM_CONFIG, Logger } from "../config";
import {
  PhysicsBody,
  BallBody,
  PaddleBody,
  CollisionResult,
  BorderCollisionResult,
} from "./types";

/**
 * Central physics engine for server-side authoritative physics
 * Handles: movement, gravity, collision detection, collision response
 */
export class PhysicsEngine {
  private scene: Scene;
  private gravity: Vector3;

  constructor(scene: Scene) {
    this.scene = scene;
    this.gravity = new Vector3(0, PHYSICS.GRAVITY, 0);
  }

  /**
   * Update ball physics: movement, gravity, and fall detection
   * Uses continuous collision detection for high-speed movement
   */
  public updateBall(body: BallBody, deltaTimeMs: number): void {
    if (!body.isEnabled) return;

    // Store previous position for continuous collision detection
    body.previousX = body.mesh.position.x;
    body.previousZ = body.mesh.position.z;

    // Apply velocity to position (frame-based physics for consistent gameplay)
    body.mesh.position.addInPlace(body.velocity);

    // Apply gravity when ball is falling
    if (body.isInFall) {
      body.velocity.addInPlace(this.gravity);
    }

    // Check if ball left the table in Z direction (start falling)
    // X direction is handled by border collisions, so only check Z for falling
    // IMPORTANT: Use FALL_THRESHOLD_Z (5.5) instead of tableDepthHalf (5)
    // This ensures goals are detected BEFORE ball starts falling
    if (
      !body.isInFall &&
      Math.abs(body.mesh.position.z) > ROOM_CONFIG.FALL_THRESHOLD_Z
    ) {
      Logger.physics(
        `Ball marked as falling: z=${body.mesh.position.z.toFixed(2)}, threshold=${ROOM_CONFIG.FALL_THRESHOLD_Z}`,
      );
      body.isInFall = true;
    }

    // Check if ball fell below threshold
    if (body.isInFall && body.mesh.position.y <= body.fallThreshold) {
      Logger.physics(
        `Ball disabled: y=${body.mesh.position.y.toFixed(2)}, fallThreshold=${body.fallThreshold}`,
      );
      this.disableBody(body);
    }
  }

  /**
   * Move paddle with constraint checking
   */
  public movePaddle(body: PaddleBody, directionX: number): void {
    if (!body.isEnabled || directionX === 0) return;

    const newX = body.mesh.position.x + directionX * body.moveSpeed;
    body.mesh.position.x = Math.max(body.minX, Math.min(body.maxX, newX));
  }

  /**
   * Check for collision between ball and table borders using continuous collision detection
   * This handles high-speed balls that might tunnel through walls in a single frame
   * Returns collision info including exact collision position
   */
  public checkBallBorderCollision(ball: BallBody): BorderCollisionResult {
    if (!ball.isEnabled || ball.isInFall) {
      return { hasCollision: false, borderDirection: 0, collisionX: 0 };
    }

    const ballRadius = GMCN.BALL.RADIUS;
    const prevBallLeftEdge = ball.previousX - ballRadius;
    const prevBallRightEdge = ball.previousX + ballRadius;
    const currBallLeftEdge = ball.mesh.position.x - ballRadius;
    const currBallRightEdge = ball.mesh.position.x + ballRadius;

    const leftBorder = GMCN.BORDERS.LEFT_EDGE;
    const rightBorder = GMCN.BORDERS.RIGHT_EDGE;

    // Check if ball crossed left border between previous and current position
    // (was on the right side of left border, now on the left side)
    if (prevBallLeftEdge > leftBorder && currBallLeftEdge <= leftBorder) {
      // Calculate exact collision X position (where ball edge touches border)
      return {
        hasCollision: true,
        borderDirection: -1,
        collisionX: leftBorder + ballRadius,
      };
    }

    // Check if ball crossed right border between previous and current position
    // (was on the left side of right border, now on the right side)
    if (prevBallRightEdge < rightBorder && currBallRightEdge >= rightBorder) {
      // Calculate exact collision X position (where ball edge touches border)
      return {
        hasCollision: true,
        borderDirection: 1,
        collisionX: rightBorder - ballRadius,
      };
    }

    // TUNNELING PROTECTION: If ball moved so fast it completely crossed the border
    // (previous and current are both on wrong side), detect and correct
    if (prevBallLeftEdge > leftBorder && currBallRightEdge < leftBorder) {
      // Ball tunneled through left border - snap back to border
      return {
        hasCollision: true,
        borderDirection: -1,
        collisionX: leftBorder + ballRadius,
      };
    }
    if (prevBallRightEdge < rightBorder && currBallLeftEdge > rightBorder) {
      // Ball tunneled through right border - snap back to border
      return {
        hasCollision: true,
        borderDirection: 1,
        collisionX: rightBorder - ballRadius,
      };
    }

    // No collision detected
    return { hasCollision: false, borderDirection: 0, collisionX: 0 };
  }

  /**
   * Resolve ball-border collision by placing ball at exact collision point and reversing X velocity
   */
  public resolveBallBorderCollision(
    ball: BallBody,
    collisionResult: BorderCollisionResult,
  ): void {
    if (!collisionResult.hasCollision) return;

    // Place ball at exact collision position (prevents tunneling)
    ball.mesh.position.x = collisionResult.collisionX;

    // Reverse X velocity (bounce off the wall)
    ball.velocity.x *= -1;

    // No speed boost on wall hits - speed only increases from paddle hits
  }

  /**
   * Enforce maximum speed limit on ball to prevent physics instability
   */
  private enforceSpeedLimit(ball: BallBody): void {
    const speed = ball.velocity.length();
    if (speed > PHYSICS.BALL.MAX_SPEED) {
      const scale = PHYSICS.BALL.MAX_SPEED / speed;
      ball.velocity.scaleInPlace(scale);
    }
  }

  /**
   * Safety clamp to ensure ball never goes beyond borders
   * Call this after all physics updates as a final safety net
   */
  public clampBallToTable(ball: BallBody): void {
    if (!ball.isEnabled || ball.isInFall) return;

    const ballRadius = GMCN.BALL.RADIUS;
    const leftBorder = GMCN.BORDERS.LEFT_EDGE + ballRadius;
    const rightBorder = GMCN.BORDERS.RIGHT_EDGE - ballRadius;

    // Hard clamp to prevent any escape
    if (ball.mesh.position.x < leftBorder) {
      ball.mesh.position.x = leftBorder;
      ball.velocity.x = Math.abs(ball.velocity.x); // Push back into play
    } else if (ball.mesh.position.x > rightBorder) {
      ball.mesh.position.x = rightBorder;
      ball.velocity.x = -Math.abs(ball.velocity.x); // Push back into play
    }
  }

  /**
   * Check for collision between ball and paddle
   * Uses quick distance pre-check before expensive precise check
   * @param paddleFrontZOffset - Positive for near paddle, negative for far paddle
   */
  public checkBallPaddleCollision(
    ball: BallBody,
    paddle: PaddleBody,
    paddleFrontZOffset: number,
  ): CollisionResult {
    if (!ball.isEnabled || !paddle.isEnabled) {
      return { hasCollision: false, impactX: 0, impactZ: 0 };
    }

    const ballPos = ball.mesh.position;
    const paddlePos = paddle.mesh.position;
    const paddleFrontZ = paddlePos.z + paddleFrontZOffset;

    // Quick AABB check first (cheaper than distance)
    // Ball must be BETWEEN paddle and center of table to potentially collide
    // For near paddle (offset > 0): ball is behind paddle when ball.z > paddleFrontZ
    // For far paddle (offset < 0): ball is behind paddle when ball.z < paddleFrontZ
    const isNearPaddle = paddleFrontZOffset > 0;
    const isBallBehindPaddle = isNearPaddle
      ? ballPos.z > paddleFrontZ // Ball passed near paddle (went too far negative)
      : ballPos.z < paddleFrontZ; // Ball passed far paddle (went too far positive)
    if (isBallBehindPaddle) {
      return { hasCollision: false, impactX: 0, impactZ: 0 };
    }

    // Quick distance pre-check using squared distance (avoid sqrt)
    const dx = ballPos.x - paddlePos.x;
    const dy = ballPos.y - paddlePos.y;
    const dz = ballPos.z - paddlePos.z;
    const squaredDistance = dx * dx + dy * dy + dz * dz;

    if (squaredDistance > PHYSICS.COLLISION.MAX_DISTANCE_SQ) {
      return { hasCollision: false, impactX: 0, impactZ: 0 };
    }

    // Precise mesh intersection check
    ball.mesh.computeWorldMatrix(true);
    paddle.mesh.computeWorldMatrix(true);
    const hasCollision = ball.mesh.intersectsMesh(paddle.mesh, false);

    return {
      hasCollision,
      impactX: ballPos.x,
      impactZ: paddleFrontZ,
    };
  }

  /**
   * Resolve ball-paddle collision with angle-based bounce and constant speed boost
   *
   * Bounce angle behavior:
   * - Center hit: straight back (0 degrees)
   * - Edge hit: sharp angle (up to PHYSICS.RESPONSE.MAX_BOUNCE_ANGLE_DEG degrees)
   *
   * Speed behavior:
   * - All paddle hits apply constant PADDLE_SPEED_BOOST regardless of impact position
   * - Edge proximity only affects angle, not speed
   */
  public resolveBallPaddleCollision(
    ball: BallBody,
    paddle: PaddleBody,
    impactX: number,
  ): void {
    const paddleHalfWidth = GMCN.PADDLE.SIZE.width / 2;
    const paddleCenterX = paddle.mesh.position.x;

    // Calculate normalized offset from paddle center (-1 to 1)
    // -1 = left edge, 0 = center, 1 = right edge
    const offsetFromCenter = Math.max(
      -1,
      Math.min(1, (impactX - paddleCenterX) / paddleHalfWidth),
    );

    // Bounce angle: 0 at center, up to MAX_BOUNCE_ANGLE_DEG degrees at edges (in radians)
    const maxBounceAngle =
      (PHYSICS.RESPONSE.MAX_BOUNCE_ANGLE_DEG * Math.PI) / 180;
    const bounceAngle = offsetFromCenter * maxBounceAngle;

    // Current speed (magnitude of velocity)
    const currentSpeed = Math.sqrt(
      ball.velocity.x * ball.velocity.x + ball.velocity.z * ball.velocity.z,
    );

    // Apply constant speed boost on all paddle hits (not affected by edge proximity)
    let newSpeed =
      currentSpeed *
      PHYSICS.RESPONSE.PADDLE_SPEED_BOOST *
      PHYSICS.BALL.BOUNCE_RESTITUTION;

    // Clamp to max speed to prevent erratic behavior
    newSpeed = Math.min(newSpeed, PHYSICS.BALL.MAX_SPEED);

    // Determine Z direction based on paddle position
    // Near paddle (negative Z): bounce toward positive Z
    // Far paddle (positive Z): bounce toward negative Z
    const zDirection = paddle.mesh.position.z > 0 ? -1 : 1;

    // Calculate new velocity vector (angle from edge, speed constant)
    ball.velocity.x = Math.sin(bounceAngle) * newSpeed;
    ball.velocity.z = zDirection * Math.cos(bounceAngle) * newSpeed;
  }

  /**
   * Launch ball with serve velocity
   * If direction not specified, uses randomized angle within configured range
   */
  public launchBall(
    body: BallBody,
    directionX?: number,
    directionZ?: number,
  ): void {
    body.isInFall = false;
    body.mesh.position.set(0, body.spawnY, 0);

    if (directionX === undefined || directionZ === undefined) {
      // Randomize direction within configured angle range
      const angle =
        Math.random() *
          (PHYSICS.LAUNCH.MAX_ANGLE_DEG - PHYSICS.LAUNCH.MIN_ANGLE_DEG) +
        PHYSICS.LAUNCH.MIN_ANGLE_DEG;
      const angleRad = (angle * Math.PI) / 180;

      // Random side (left or right)
      const side = Math.random() < 0.5 ? -1 : 1;

      // Random Z direction (toward player 1 or player 2)
      const zDirection = Math.random() < 0.5 ? -1 : 1;

      directionX = side * Math.sin(angleRad);
      directionZ = zDirection * Math.cos(angleRad);

      // Normalize and apply speed
      const magnitude = Math.sqrt(
        directionX * directionX + directionZ * directionZ,
      );
      body.velocity.set(
        (directionX / magnitude) * PHYSICS.LAUNCH.BASE_SPEED,
        0,
        (directionZ / magnitude) * PHYSICS.LAUNCH.BASE_SPEED,
      );
    } else {
      // Use provided direction (backward compatibility)
      body.velocity.set(
        directionX,
        0,
        directionZ * GMCN.PHYSICS.SERVE_VELOCITY_Z,
      );
    }

    body.isEnabled = true;
    body.mesh.setEnabled(true);
    body.previousX = 0; // Reset previous position
    body.previousZ = 0; // Reset previous Z position
  }

  /**
   * Respawn ball at center position (visible but not moving)
   * Used after ball falls off table - positions ball but doesn't launch
   */
  public respawnBallAtCenter(body: BallBody): void {
    body.isInFall = false;
    body.velocity.setAll(0); // No velocity - ball stays still
    body.mesh.position.set(0, body.spawnY, 0);
    body.isEnabled = true;
    body.mesh.setEnabled(true);
    body.previousX = 0;
    body.previousZ = 0;
  }

  /**
   * Disable physics body (e.g., when ball falls off table)
   */
  public disableBody(body: PhysicsBody): void {
    body.isEnabled = false;
    body.velocity.setAll(0);
    body.mesh.setEnabled(false);
  }

  /**
   * Enable physics body
   */
  public enableBody(body: PhysicsBody): void {
    body.isEnabled = true;
    body.mesh.setEnabled(true);
  }

  /**
   * Create a standard ball physics body
   */
  public createBallBody(
    mesh: Mesh,
    tableWidth: number,
    tableDepth: number,
  ): BallBody {
    const spawnY =
      GMCN.TABLE.Y_POSITION + GMCN.TABLE.SIZE.height / 2 + GMCN.BALL.RADIUS;

    return {
      mesh,
      velocity: Vector3.Zero(),
      isEnabled: false,
      isStatic: false,
      mass: PHYSICS.BALL.MASS,
      restitution: PHYSICS.BALL.BOUNCE_RESTITUTION,
      friction: PHYSICS.BALL.FRICTION,
      isInFall: false,
      fallThreshold: PHYSICS.RESPAWN.FALL_THRESHOLD,
      spawnY,
      tableWidthHalf: tableWidth / 2,
      tableDepthHalf: tableDepth / 2,
      previousX: 0,
      previousZ: 0,
    };
  }

  /**
   * Create a standard paddle physics body
   * @param mesh - The mesh to attach physics to
   * @param isFarEnd - If true, places paddle at far end (positive Z), otherwise near end (negative Z)
   */
  public createPaddleBody(mesh: Mesh, isFarEnd: boolean = false): PaddleBody {
    const spawnY =
      GMCN.TABLE.Y_POSITION +
      GMCN.TABLE.SIZE.height / 2 +
      GMCN.PADDLE.SIZE.height / 2;

    const limit = GMCN.TABLE.SIZE.width / 2 - GMCN.PADDLE.SIZE.width / 2;

    mesh.position.y = spawnY;
    // Near end: negative Z, Far end: positive Z
    mesh.position.z = isFarEnd
      ? GMCN.TABLE.SIZE.depth / 2 - GMCN.PADDLE.SIZE.depth / 2
      : -GMCN.TABLE.SIZE.depth / 2 + GMCN.PADDLE.SIZE.depth / 2;

    return {
      mesh,
      velocity: Vector3.Zero(),
      isEnabled: true,
      isStatic: false,
      mass: PHYSICS.PADDLE.MASS,
      restitution: PHYSICS.PADDLE.BOUNCE_RESTITUTION,
      friction: PHYSICS.PADDLE.FRICTION,
      moveSpeed: GMCN.PADDLE.SPEED,
      minX: -limit,
      maxX: limit,
    };
  }
}
