/**
 * Physics types and interfaces for the server-side physics engine
 */

import { Vector3, Mesh } from "@babylonjs/core";

/**
 * Physics body for an entity participating in physics simulation
 */
export interface PhysicsBody {
  mesh: Mesh;
  velocity: Vector3;
  isEnabled: boolean;
  isStatic: boolean;
  mass: number;
  restitution: number;
  friction: number;
}

/**
 * Ball physics body with additional game-specific properties
 */
export interface BallBody extends PhysicsBody {
  isInFall: boolean;
  fallThreshold: number;
  spawnY: number;
  tableWidthHalf: number;
  tableDepthHalf: number;
  previousX: number; // For continuous collision detection on X axis
  previousZ: number; // For continuous collision detection on Z axis (paddle collisions)
}

/**
 * Paddle physics body with constraint properties
 */
export interface PaddleBody extends PhysicsBody {
  moveSpeed: number;
  minX: number;
  maxX: number;
}

/**
 * Result of a collision check
 */
export interface CollisionResult {
  hasCollision: boolean;
  impactX: number;
  impactZ: number;
}

/**
 * Border collision result
 */
export interface BorderCollisionResult {
  hasCollision: boolean;
  borderDirection: number; // -1 for left, 1 for right, 0 for none
  collisionX: number; // Exact X position where collision should occur
}
