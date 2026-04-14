import { Mesh, Scene } from "@babylonjs/core";
/**
 * Shared Paddle entity: handles mesh creation, position, enable/disable.
 * Extend/add material/physics/animation logic in subclasses.
 */
export declare class BasePaddle {
    mesh: Mesh;
    constructor(scene: Scene, name?: string);
    getPosition(): {
        x: number;
        y: number;
        z: number;
    };
    setEnabled(enabled: boolean): void;
}
