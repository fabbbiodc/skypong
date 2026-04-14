import { Mesh, MeshBuilder, Scene } from "@babylonjs/core";
import { MaterialFactory } from "../factories/MaterialFactory";
import { MAT } from "../config/Materials";
import { GMCN } from '@skypong/common/constants';

import { BaseTable } from "@skypong/common/entities/BaseTable";

export class ClientTable extends BaseTable {
    public mesh: Mesh;
    private scene: Scene;

    constructor(scene: Scene) {
        super(scene, "clientTable");
        this.scene = scene;
        this.mesh = MeshBuilder.CreateBox(
            "clientTable",
            GMCN.TABLE.SIZE,
            scene,
        );
        this.mesh.position.y = GMCN.TABLE.Y_POSITION;

        const tableMat = MaterialFactory.CreatePBRMaterial(
            this.scene,
            "woodfloor",
            MAT.INFO.WOODFLOOR
        );

        this.mesh.material = tableMat;
    }
}
