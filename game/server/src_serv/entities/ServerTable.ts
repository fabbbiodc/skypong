import { Mesh, MeshBuilder, Scene } from "@babylonjs/core";
import { GMCN } from "@skypong/common/constants";

/**
 * Server-side table entity - static game environment
 */
import { BaseTable } from "@skypong/common/entities/BaseTable";

export class ServerTable extends BaseTable {
  public mesh!: Mesh;

  constructor(scene: Scene) {
    super(scene, "table");
    this.mesh = MeshBuilder.CreateBox("table", GMCN.TABLE.SIZE, scene);

    this.mesh.position.y = GMCN.TABLE.Y_POSITION;
  }
}
