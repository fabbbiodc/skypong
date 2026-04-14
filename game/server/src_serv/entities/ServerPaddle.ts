import { Mesh, MeshBuilder, Scene } from "@babylonjs/core";
import { GMCN } from "@skypong/common/constants";
import { PhysicsEngine, PaddleBody } from "../physics";

/**
 * Server-side paddle entity - pure data wrapper around physics body
 * All physics logic is handled by PhysicsEngine
 */
import { BasePaddle } from "@skypong/common/entities/BasePaddle";

export class ServerPaddle extends BasePaddle {
    public mesh: Mesh;
    public physicsBody: PaddleBody;
    public isFarEnd: boolean;

    constructor(scene: Scene, physicsEngine: PhysicsEngine, isFarEnd: boolean = false) {
        super(scene, isFarEnd ? "serverPaddle2" : "serverPaddle");
        this.isFarEnd = isFarEnd;
        this.mesh = MeshBuilder.CreateBox(
            isFarEnd ? "serverPaddle2" : "serverPaddle",
            GMCN.PADDLE.SIZE,
            scene,
        );

        this.physicsBody = physicsEngine.createPaddleBody(this.mesh, isFarEnd);
    }

    /**
     * Move paddle in X direction - delegates to physics engine
     */
    public move(directionX: number, physicsEngine: PhysicsEngine): void {
        physicsEngine.movePaddle(this.physicsBody, directionX);
    }

    /**
     * Get current position for state sync
     */
    public getPosition(): { x: number; y: number; z: number } {
        return {
            x: this.mesh.position.x,
            y: this.mesh.position.y,
            z: this.mesh.position.z,
        };
    }

    /**
     * Check if paddle is enabled
     */
    public isEnabled(): boolean {
        return this.physicsBody.isEnabled;
    }

    /**
     * Set paddle position directly (for testing/reset)
     */
    public setPosition(x: number, y?: number, z?: number): void {
        this.mesh.position.x = x;
        if (y !== undefined) this.mesh.position.y = y;
        if (z !== undefined) this.mesh.position.z = z;
    }
}
