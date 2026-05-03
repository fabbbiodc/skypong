import { Vector3, Mesh, Scene } from "@babylonjs/core";
import { PHYSICS, GMCN } from "@skypong/common/constants";
import {
  PhysicsBody,
  BallBody,
  PaddleBody,
  CollisionResult,
  BorderCollisionResult,
} from "./types";

// Simple client-side logging (can disable via environment)
const DEBUG_MODE = false;
const clientLogger = {
  physics: (msg: string, ...args: unknown[]) => {
    if (DEBUG_MODE) console.log(`[PHYSICS] ${msg}`, ...args);
  },
  goal: (msg: string, ...args: unknown[]) => console.log(`[GOAL] ${msg}`, ...args),
};

// Room configuration adapted for client
const ROOM_CONFIG = {
  GOAL_THRESHOLD: GMCN.TABLE.SIZE.depth / 2 + 0.1, // Simplified fallback
  PADDLE_FRONT_OFFSET: GMCN.PADDLE.SIZE.depth / 2 + GMCN.BALL.RADIUS,
  FALL_THRESHOLD_Z: GMCN.TABLE.SIZE.depth / 2 + 0.1, // Simplified fallback
} as const;

/**
 * Client-side physics engine for local game simulation
 * Adapted from server PhysicsEngine to run in browser without server authority
 * Handles: movement, gravity, collision detection, collision response
 */
export class ClientPhysicsEngine {
  private gravity: Vector3;

  constructor() {
    this.gravity = new Vector3(0, PHYSICS.GRAVITY, 0);
  }

  /**
   * Update ball physics: movement, gravity, and fall detection
   * Uses continuous collision detection for high-speed movement
   */
  public updateBall(body: BallBody): void {
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
    if (
      !body.isInFall &&
      Math.abs(body.mesh.position.z) > ROOM_CONFIG.FALL_THRESHOLD_Z
    ) {
      clientLogger.physics(
        `Ball marked as falling: z=${body.mesh.position.z.toFixed(2)}, threshold=${ROOM_CONFIG.FALL_THRESHOLD_Z}`,
      );
      body.isInFall = true;
    }

    // Check if ball fell below threshold
    if (body.isInFall && body.mesh.position.y <= body.fallThreshold) {
      clientLogger.physics(
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

    // Check if ball crossed left border
    if (prevBallLeftEdge > leftBorder && currBallLeftEdge <= leftBorder) {
      return {
        hasCollision: true,
        borderDirection: -1,
        collisionX: leftBorder + ballRadius,
      };
    }

    // Check if ball crossed right border
    if (prevBallRightEdge < rightBorder && currBallRightEdge >= rightBorder) {
      return {
        hasCollision: true,
        borderDirection: 1,
        collisionX: rightBorder - ballRadius,
      };
    }

    // Tunneling protection
    if (prevBallLeftEdge > leftBorder && currBallRightEdge < leftBorder) {
      return {
        hasCollision: true,
        borderDirection: -1,
        collisionX: leftBorder + ballRadius,
      };
    }
    if (prevBallRightEdge < rightBorder && currBallLeftEdge > rightBorder) {
      return {
        hasCollision: true,
        borderDirection: 1,
        collisionX: rightBorder - ballRadius,
      };
    }

    return { hasCollision: false, borderDirection: 0, collisionX: 0 };
  }

  /**
   * Resolve ball-border collision by reversing X velocity
   */
  public resolveBallBorderCollision(
    ball: BallBody,
    collisionResult: BorderCollisionResult,
  ): void {
    if (!collisionResult.hasCollision) return;

    ball.mesh.position.x = collisionResult.collisionX;
    ball.velocity.x *= -1;
  }

  /**
   * Safety clamp to ensure ball never goes beyond borders
   */
  public clampBallToTable(ball: BallBody): void {
    if (!ball.isEnabled || ball.isInFall) return;

    const ballRadius = GMCN.BALL.RADIUS;
    const leftBorder = GMCN.BORDERS.LEFT_EDGE + ballRadius;
    const rightBorder = GMCN.BORDERS.RIGHT_EDGE - ballRadius;

    if (ball.mesh.position.x < leftBorder) {
      ball.mesh.position.x = leftBorder;
      ball.velocity.x = Math.abs(ball.velocity.x);
    } else if (ball.mesh.position.x > rightBorder) {
      ball.mesh.position.x = rightBorder;
      ball.velocity.x = -Math.abs(ball.velocity.x);
    }
  }

  /**
   * Check for collision between ball and paddle
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

    // Quick AABB check
    const isNearPaddle = paddleFrontZOffset > 0;
    const isBallBehindPaddle = isNearPaddle
      ? ballPos.z > paddleFrontZ
      : ballPos.z < paddleFrontZ;
    if (isBallBehindPaddle) {
      return { hasCollision: false, impactX: 0, impactZ: 0 };
    }

    // Distance pre-check
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
   * Resolve ball-paddle collision with angle-based bounce
   */
  public resolveBallPaddleCollision(
    ball: BallBody,
    paddle: PaddleBody,
    impactX: number,
  ): void {
    const paddleHalfWidth = GMCN.PADDLE.SIZE.width / 2;
    const paddleCenterX = paddle.mesh.position.x;

    const offsetFromCenter = Math.max(
      -1,
      Math.min(1, (impactX - paddleCenterX) / paddleHalfWidth),
    );

    const maxBounceAngle =
      (PHYSICS.RESPONSE.MAX_BOUNCE_ANGLE_DEG * Math.PI) / 180;
    const bounceAngle = offsetFromCenter * maxBounceAngle;

    const currentSpeed = Math.sqrt(
      ball.velocity.x * ball.velocity.x + ball.velocity.z * ball.velocity.z,
    );

    let newSpeed =
      currentSpeed *
      PHYSICS.RESPONSE.PADDLE_SPEED_BOOST *
      PHYSICS.BALL.BOUNCE_RESTITUTION;

    newSpeed = Math.min(newSpeed, PHYSICS.BALL.MAX_SPEED);

    const zDirection = paddle.mesh.position.z > 0 ? -1 : 1;

    ball.velocity.x = Math.sin(bounceAngle) * newSpeed;
    ball.velocity.z = zDirection * Math.cos(bounceAngle) * newSpeed;
  }

  /**
   * Launch ball with serve velocity
   */
  public launchBall(
    body: BallBody,
    directionX?: number,
    directionZ?: number,
  ): void {
    body.isInFall = false;
    body.mesh.position.set(0, body.spawnY, 0);

    if (directionX === undefined || directionZ === undefined) {
      const angle =
        Math.random() *
          (PHYSICS.LAUNCH.MAX_ANGLE_DEG - PHYSICS.LAUNCH.MIN_ANGLE_DEG) +
        PHYSICS.LAUNCH.MIN_ANGLE_DEG;
      const angleRad = (angle * Math.PI) / 180;

      const side = Math.random() < 0.5 ? -1 : 1;
      const zDirection = Math.random() < 0.5 ? -1 : 1;

      directionX = side * Math.sin(angleRad);
      directionZ = zDirection * Math.cos(angleRad);

      const magnitude = Math.sqrt(
        directionX * directionX + directionZ * directionZ,
      );
      body.velocity.set(
        (directionX / magnitude) * PHYSICS.LAUNCH.BASE_SPEED,
        0,
        (directionZ / magnitude) * PHYSICS.LAUNCH.BASE_SPEED,
      );
    } else {
      body.velocity.set(
        directionX,
        0,
        directionZ * GMCN.PHYSICS.SERVE_VELOCITY_Z,
      );
    }

    body.isEnabled = true;
    body.mesh.setEnabled(true);
    body.previousX = 0;
    body.previousZ = 0;
  }

  /**
   * Respawn ball at center position
   */
  public respawnBallAtCenter(body: BallBody): void {
    body.isInFall = false;
    body.velocity.setAll(0);
    body.mesh.position.set(0, body.spawnY, 0);
    body.isEnabled = true;
    body.mesh.setEnabled(true);
    body.previousX = 0;
    body.previousZ = 0;
  }

  /**
   * Disable physics body
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
   */
  public createPaddleBody(mesh: Mesh, isFarEnd: boolean = false): PaddleBody {
    const spawnY =
      GMCN.TABLE.Y_POSITION +
      GMCN.TABLE.SIZE.height / 2 +
      GMCN.PADDLE.SIZE.height / 2;

    const limit = GMCN.TABLE.SIZE.width / 2 - GMCN.PADDLE.SIZE.width / 2;

    mesh.position.y = spawnY;
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
