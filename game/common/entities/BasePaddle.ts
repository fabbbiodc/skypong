import { Mesh, MeshBuilder, Scene } from "@babylonjs/core";
import { GMCN } from "@skypong/common/constants";

/**
 * Shared Paddle entity: handles mesh creation, position, enable/disable.
 * Extend/add material/physics/animation logic in subclasses.
 */
export class BasePaddle {
    public mesh: Mesh;

    constructor(scene: Scene, name: string = "sharedPaddle") {
        this.mesh = MeshBuilder.CreateBox(
            name,
            GMCN.PADDLE.SIZE,
            scene,
        );
        // Default position: on table
        this.mesh.position.y = GMCN.TABLE.Y_POSITION + GMCN.TABLE.SIZE.height/2 + GMCN.PADDLE.SIZE.height/2;
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
