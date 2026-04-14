import { Mesh, MeshBuilder, Scene } from "@babylonjs/core";
import { GMCN } from "@skypong/common/constants";

/**
 * Shared Ball entity: handles mesh creation, position, enable/disable.
 * Override/add visual or physics logic as required in platform-specific subclasses.
 */
export class BaseBall {
  public mesh: Mesh;

  constructor(scene: Scene) {
    this.mesh = MeshBuilder.CreateSphere(
      "sharedBall",
      { diameter: GMCN.BALL.DIAMETER },
      scene,
    );
    // Default position: on table
    this.mesh.position.y = GMCN.BALL.RADIUS;
  }

  public getPosition(): { x: number; y: number; z: number } {
    return {
      x: this.mesh.position.x,
      y: this.mesh.position.y,
      z: this.mesh.position.z,
    };
  }

  public setEnabled(enabled: boolean): void {
    this.mesh.setEnabled(enabled);
  }
}
