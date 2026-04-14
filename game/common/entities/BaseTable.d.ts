import { Mesh, Scene } from "@babylonjs/core";
/**
 * Shared Table entity: handles mesh creation and base positioning.
 * Extend for visuals as necessary in client.
 */
export declare class BaseTable {
  mesh: Mesh;
  constructor(scene: Scene, name?: string);
}
