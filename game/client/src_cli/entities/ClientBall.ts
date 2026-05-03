import { Mesh, MeshBuilder, Scene, Vector3, Space } from "@babylonjs/core";
import { MaterialFactory } from "../factories/MaterialFactory";
import { MAT } from "../config/Materials";
import { GMCN } from "@skypong/common/constants";
import { InterpolationEngine } from "../physics/InterpolationEngine";
import { ANIMATION } from "../config";

import { BaseBall } from "@skypong/common/entities/BaseBall";

export class ClientBall extends BaseBall {
  public mesh: Mesh;
  private previousPosition: Vector3 = new Vector3();
  private targetPosition: Vector3 = new Vector3();
  private tempPosition: Vector3 = new Vector3();
  private rotationAxis: Vector3 = new Vector3();
  private interpolationEngine: InterpolationEngine;
  private scene: Scene;
  private lastVelocity: Vector3 = new Vector3();
  private lastDeltaTime: number = 0;
  private tempVelocity: Vector3 = new Vector3();

  constructor(scene: Scene) {
    super(scene);
    this.scene = scene;
    this.mesh = MeshBuilder.CreateSphere(
      "ball",
      { diameter: GMCN.BALL.DIAMETER },
      scene,
    );
    // Position on table surface (same as BaseBall sets, but explicit)
    this.mesh.position.y = GMCN.TABLE.Y_POSITION + GMCN.TABLE.SIZE.height / 2 + GMCN.BALL.RADIUS;

    const ballMat = MaterialFactory.CreatePBRMaterial(
      scene,
      "marble",
      MAT.INFO.MARBLE,
    );
    this.mesh.material = ballMat;

    this.previousPosition.copyFrom(this.mesh.position);
    this.interpolationEngine = new InterpolationEngine();
  }

  /**
   * Trigger bounce - Approach A simply notes collision for potential visual effects
   * No position manipulation - ball continues smooth interpolation to server position
   * @param x - Impact X position (unused in Approach A, kept for API compatibility)
   * @param z - Impact Z position (unused in Approach A, kept for API compatibility)
   * @param serverCollisionTime - Server timestamp (unused in Approach A, kept for API compatibility)
   */
  public triggerBounce(
    x: number,
    z: number,
    serverCollisionTime: number = 0,
  ): void {
    // Approach A: No bounce-back animation
    // Collision events are handled by increased lerp speed in GameLoop
    // This method kept for API compatibility but does nothing
    // Future: Could trigger particle effects, sound, or mesh squash/stretch here
  }

  public update(
    enabled: boolean,
    deltaTime: number,
    velocity?: Vector3,
  ): void {
    this.mesh.setEnabled(enabled);
    this.lastDeltaTime = deltaTime;
    if (velocity) {
      this.lastVelocity.copyFrom(velocity);
    }

    this.updateRotation();
    this.previousPosition.copyFrom(this.mesh.position);
  }

  private updateRotation(): void {
    const SERVER_FPS = 60;
    const hasVelocity = this.lastVelocity.lengthSquared() > 0.000001;
    let angle: number;

    if (hasVelocity) {
      // Velocity-based rotation: physically accurate, immune to lerp damping
      // Convert server velocity from units/frame to units/sec
      this.tempVelocity.set(
        this.lastVelocity.x * SERVER_FPS,
        this.lastVelocity.y * SERVER_FPS,
        this.lastVelocity.z * SERVER_FPS,
      );
      angle = this.interpolationEngine.calculateRollingRotationFromVelocity(
        this.tempVelocity,
        GMCN.BALL.RADIUS,
        this.lastDeltaTime,
        this.rotationAxis,
      );
    } else {
      // Fallback: position-based rotation when no velocity data available
      angle = this.interpolationEngine.calculateRollingRotation(
        this.mesh.position,
        this.previousPosition,
        GMCN.BALL.RADIUS,
        this.rotationAxis,
      );
    }

    if (angle !== 0) {
      this.mesh.rotate(this.rotationAxis, angle, Space.WORLD);
    }
  }

  public setPosition(x: number, z: number): void {
    this.mesh.position.x = x;
    this.mesh.position.z = z;
    this.previousPosition.copyFrom(this.mesh.position);
  }

  public getPosition(): Vector3 {
    return this.mesh.position;
  }
}
