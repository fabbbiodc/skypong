import { Mesh, MeshBuilder, Scene } from "@babylonjs/core";
import { GMCN, PHYSICS } from "@skypong/common/constants";
import { PhysicsEngine, BallBody } from "../physics";
import { SERVER_TIMING } from "../config";

/**
 * Server-side ball entity - pure data wrapper around physics body
 * All physics logic is handled by PhysicsEngine
 */
import { BaseBall } from "@skypong/common/entities/BaseBall";

export class ServerBall extends BaseBall {
    public mesh: Mesh;
    public physicsBody: BallBody;
    private respawnTimerMs: number = 0;
    private respawnDelayMs: number = PHYSICS.RESPAWN.DELAY_MS;
    private hasBeenLaunched: boolean = false;
    private isRespawningAtCenter: boolean = false;
    private gameOver: boolean = false;

    constructor(scene: Scene, physicsEngine: PhysicsEngine) {
        super(scene);
        this.mesh = MeshBuilder.CreateSphere(
            "serverBall",
            { diameter: GMCN.BALL.DIAMETER },
            scene,
        );

        this.physicsBody = physicsEngine.createBallBody(
            this.mesh,
            GMCN.TABLE.SIZE.width,
            GMCN.TABLE.SIZE.depth
        );

        // Position ball at spawn location (on top of table)
        this.mesh.position.set(0, this.physicsBody.spawnY, 0);

        // Make ball visible at spawn position from the start
        // Ball is visible but not moving until launch() is called
        this.physicsBody.isEnabled = true;
        this.mesh.setEnabled(true);
    }

    /**
     * Update ball state - delegates to physics engine
     */
    public update(deltaTimeMs: number, physicsEngine: PhysicsEngine): void {
        // Don't update if game is over
        if (this.gameOver) {
            return;
        }

        // Handle respawn timer when ball is disabled (but only after first launch)
        if (!this.physicsBody.isEnabled && this.hasBeenLaunched) {
            this.respawnTimerMs += deltaTimeMs;
            if (this.respawnTimerMs >= this.respawnDelayMs) {
                // Stage 1: Respawn at center (visible but not moving)
                physicsEngine.respawnBallAtCenter(this.physicsBody);
                this.isRespawningAtCenter = true;
                this.respawnTimerMs = 0;
            }
            return;
        }

        // Stage 2: Ball is respawned at center, wait then relaunch
        if (this.isRespawningAtCenter) {
            this.respawnTimerMs += deltaTimeMs;
            if (this.respawnTimerMs >= SERVER_TIMING.RESPAWN.RELAUNCH_DELAY_MS) {
                // Now launch the ball with random direction
                physicsEngine.launchBall(this.physicsBody);
                this.isRespawningAtCenter = false;
                this.respawnTimerMs = 0;
            }
            return;
        }

        // Only update physics if ball has been launched and is moving
        if (this.hasBeenLaunched && !this.isRespawningAtCenter) {
            physicsEngine.updateBall(this.physicsBody, deltaTimeMs);
        }
    }

    /**
     * Launch the ball (manual serve)
     */
    public launch(physicsEngine: PhysicsEngine): void {
        physicsEngine.launchBall(this.physicsBody);
        this.respawnTimerMs = 0;
        this.hasBeenLaunched = true;
        this.isRespawningAtCenter = false;
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
     * Check if ball is enabled
     */
    public isEnabled(): boolean {
        return this.physicsBody.isEnabled;
    }

    /**
     * Enable or disable the ball
     */
    public setEnabled(enabled: boolean): void {
        this.physicsBody.isEnabled = enabled;
        this.mesh.setEnabled(enabled);
    }

    /**
     * Set game over state - prevents auto-respawn
     */
    public setGameOver(gameOver: boolean): void {
        this.gameOver = gameOver;
    }

    /**
     * Check if ball is falling (for debugging/monitoring)
     */
    public isInFall(): boolean {
        return this.physicsBody.isInFall;
    }

    /**
     * Reset respawn timer (for testing)
     */
    public resetRespawnTimer(): void {
        this.respawnTimerMs = 0;
    }
}
