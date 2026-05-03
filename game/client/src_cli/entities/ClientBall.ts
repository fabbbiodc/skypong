import { Mesh, MeshBuilder, Scene, Vector3, Space } from "@babylonjs/core";
import { MaterialFactory } from "../factories/MaterialFactory";
import { MAT } from "../config/Materials";
import { GMCN } from "@skypong/common/constants";
import { ANIMATION } from "../config";

import { BaseBall } from "@skypong/common/entities/BaseBall";

export class ClientBall extends BaseBall {
  public mesh: Mesh;
  private previousPosition: Vector3 = new Vector3();
  private rotationAxis: Vector3 = new Vector3();
  private lastVelocity: Vector3 = new Vector3();
  private lastDeltaTime: number = 0;
  private tempVelocity: Vector3 = new Vector3();

  constructor(scene: Scene) {
    super(scene);
    this.mesh = MeshBuilder.CreateSphere(
      "ball",
      { diameter: GMCN.BALL.DIAMETER },
      scene,
    );
    // Position on table surface (same as BaseBall sets, but explicit)
    this.mesh.position.y =
      GMCN.TABLE.Y_POSITION +
      GMCN.TABLE.SIZE.height / 2 +
      GMCN.BALL.RADIUS;

    const ballMat = MaterialFactory.CreatePBRMaterial(
      scene,
      "marble",
      MAT.INFO.MARBLE,
    );
    this.mesh.material = ballMat;

    this.previousPosition.copyFrom(this.mesh.position);
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
    const hasVelocity = this.lastVelocity.lengthSquared() > 0.000001;
    let angle: number = 0;

    if (hasVelocity) {
      // Velocity-based rotation: physically accurate
      // Convert from units/frame to units/second (assuming 60fps)
      const SERVER_FPS = 60;
      const vxPerSec = this.lastVelocity.x * SERVER_FPS;
      const vzPerSec = this.lastVelocity.z * SERVER_FPS;
      const speedXZ = Math.sqrt(vxPerSec * vxPerSec + vzPerSec * vzPerSec);

      if (speedXZ > 0.0001) {
        // Rotation axis perpendicular to velocity direction
        this.rotationAxis.set(-vzPerSec, 0, vxPerSec);
        this.rotationAxis.normalize();

        // Physics formula: ω = v/r, then angle = ω × time (in seconds)
        const angularVelocity = speedXZ / GMCN.BALL.RADIUS;
        angle = -angularVelocity * (this.lastDeltaTime / 1000);
      }
    } else {
      // Fallback: position-based rotation
      const dx = this.mesh.position.x - this.previousPosition.x;
      const dz = this.mesh.position.z - this.previousPosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance > 0.0001) {
        // Rotation axis perpendicular to movement direction
        this.rotationAxis.set(-dz, 0, dx);
        this.rotationAxis.normalize();

        // Rotation angle = arc length / radius
        angle = -distance / GMCN.BALL.RADIUS;
      }
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
