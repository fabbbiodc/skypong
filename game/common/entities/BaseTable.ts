import { Mesh, MeshBuilder, Scene } from "@babylonjs/core";
import { GMCN } from "@skypong/common/constants";

/**
 * Shared Table entity: handles mesh creation and base positioning.
 * Extend for visuals as necessary in client.
 */
export class BaseTable {
    public mesh: Mesh;

    constructor(scene: Scene, name: string = "sharedTable") {
        this.mesh = MeshBuilder.CreateBox(
            name,
            GMCN.TABLE.SIZE,
            scene,
        );
        this.mesh.position.y = GMCN.TABLE.Y_POSITION;
    }
}
