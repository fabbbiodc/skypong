import { Mesh, Scene } from "@babylonjs/core";
/**
 * Shared Ball entity: handles mesh creation, position, enable/disable.
 * Override/add visual or physics logic as required in platform-specific subclasses.
 */
export declare class BaseBall {
    mesh: Mesh;
    constructor(scene: Scene);
    getPosition(): {
        x: number;
        y: number;
        z: number;
    };
    setEnabled(enabled: boolean): void;
}
