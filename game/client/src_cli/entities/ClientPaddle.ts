import { Mesh, MeshBuilder, Scene, Vector3, Color3, AbstractMesh } from "@babylonjs/core";
import { GMCN } from '@skypong/common/constants';
import { MaterialFactory } from "../factories/MaterialFactory";
import { MAT, IMaterialOptions } from "../config/Materials";
import { InterpolationEngine } from "../physics/InterpolationEngine";

export type MaterialKey = keyof typeof MAT.INFO;

import { BasePaddle } from "@skypong/common/entities/BasePaddle";

export class ClientPaddle extends BasePaddle {
    public mesh: Mesh;
    private targetPosition: Vector3 = new Vector3();
    private tempPosition: Vector3 = new Vector3();
    private interpolationEngine: InterpolationEngine;
    private scene: Scene;
    private spawnY: number =
        GMCN.TABLE.Y_POSITION +
        GMCN.TABLE.SIZE.height / 2 +
        GMCN.PADDLE.SIZE.height / 2;

constructor(
    scene: Scene,
    options?: {
        name?: string;
        materialKey?: MaterialKey;
        albedoColor?: Color3;
        tintColor?: Color3;
        refractionRenderList?: AbstractMesh[];
    }
) {
    super(scene, options?.name ?? "clientPaddle");
        this.scene = scene;
        this.interpolationEngine = new InterpolationEngine();

        const paddleName = options?.name ?? "clientPaddle";

        this.mesh = MeshBuilder.CreateBox(
            paddleName,
            GMCN.PADDLE.SIZE,
            scene,
        );

        const materialKey = options?.materialKey ?? "CLEARGLASS";
        const baseOptions: IMaterialOptions = { ...MAT.INFO[materialKey] };

        if (options?.albedoColor !== undefined) {
            baseOptions.albedoColor = options.albedoColor;
        }
        if (options?.tintColor !== undefined) {
            baseOptions.tintColor = options.tintColor;
        }

        const materialName = materialKey === "CLEARGLASS" ? "glass" : materialKey.toLowerCase();
        
        const paddleMat = MaterialFactory.CreatePBRMaterial(
            scene,
            materialName,
            baseOptions,
        );

        this.mesh.material = paddleMat;
        this.mesh.position.y = this.spawnY;

        if (options?.refractionRenderList && baseOptions.isRefractive) {
            const refractionTexture = (paddleMat as any).subSurface?.refractionTexture;
            if (refractionTexture) {
                refractionTexture.renderList = options.refractionRenderList;
            }
        }
    }

    getPosition(): { x: number; y: number; z: number } {
        return {
            x: this.mesh.position.x,
            y: this.mesh.position.y,
            z: this.mesh.position.z,
        };
    }

    public update(
        targetPosition: Vector3,
        lerpFactor: number,
        enabled: boolean,
    ): void {
        const justEnabled = enabled && !this.mesh.isEnabled();
        this.mesh.setEnabled(enabled);

        if (enabled) {
            this.targetPosition.copyFrom(targetPosition);
            
            if (justEnabled) {
                this.mesh.position.copyFrom(this.targetPosition);
            } else {
                this.interpolationEngine.interpolate(
                    this.mesh.position,
                    this.targetPosition,
                    lerpFactor,
                    this.tempPosition
                );
                this.mesh.position.copyFrom(this.tempPosition);
            }
        }
    }
}
