import { Vector3 } from "@babylonjs/core";
import { INTERPOLATION } from '@skypong/common/constants';

export interface InterpolationConfig {
    defaultSpeed: number;
    collisionSpeed: number;
}

/**
 * Simplified InterpolationEngine for Approach A
 * Handles smooth position interpolation and rolling rotation
 * Bounce animation system removed for cleaner server-following behavior
 */
export class InterpolationEngine {
    private config: InterpolationConfig;

    constructor(config: Partial<InterpolationConfig> = {}) {
        this.config = {
            defaultSpeed: config.defaultSpeed ?? INTERPOLATION.DEFAULT_SPEED,
            collisionSpeed: config.collisionSpeed ?? INTERPOLATION.COLLISION_SPEED,
        };
    }

    /**
     * Calculate lerp factor using exponential smoothing
     * @param deltaTime - Time since last frame in milliseconds
     * @param isCollision - Whether collision occurred recently (increases speed)
     * @returns Lerp factor between 0 and 1
     */
    public calculateLerpFactor(deltaTime: number, isCollision: boolean): number {
        const speed = isCollision ? this.config.collisionSpeed : this.config.defaultSpeed;
        return 1 - Math.exp(-speed * (deltaTime / 1000));
    }

    /**
     * Smoothly interpolate between current and target position
     * @param current - Current position
     * @param target - Target position (from server)
     * @param lerpFactor - Interpolation factor (0 = stay at current, 1 = jump to target)
     * @param out - Output vector to store result
     */
    public interpolate(
        current: Vector3,
        target: Vector3,
        lerpFactor: number,
        out: Vector3
    ): void {
        Vector3.LerpToRef(current, target, lerpFactor, out);
    }

    /**
     * Calculate rolling rotation for ball based on movement
     * @param currentPosition - Current ball position
     * @param previousPosition - Previous ball position
     * @param radius - Ball radius
     * @param outAxis - Output axis of rotation
     * @returns Rotation angle in radians
     */
    public calculateRollingRotation(
        currentPosition: Vector3,
        previousPosition: Vector3,
        radius: number,
        outAxis: Vector3
    ): number {
        const displacementX = currentPosition.x - previousPosition.x;
        const displacementZ = currentPosition.z - previousPosition.z;
        const distance = Math.sqrt(displacementX * displacementX + displacementZ * displacementZ);

        const MIN_ROTATION_DISTANCE = 0.0001;
        if (distance < MIN_ROTATION_DISTANCE) {
            return 0;
        }

        // Rotation axis perpendicular to movement direction
        outAxis.set(-displacementZ, 0, displacementX);
        outAxis.normalize();

        // Rotation angle = arc length / radius
        return -distance / radius;
    }
    
    /**
     * Calculate rolling rotation from velocity (Part 3 of hybrid solution)
     * This method uses server velocity instead of lerp displacement for accurate rotation
     * Formula: angular velocity (ω) = linear velocity (v) / radius (r)
     * @param velocity - Ball velocity from server (units per second)
     * @param radius - Ball radius
     * @param deltaTime - Time since last frame in milliseconds
     * @param outAxis - Output axis of rotation
     * @returns Rotation angle in radians for this frame
     */
    public calculateRollingRotationFromVelocity(
        velocity: Vector3,
        radius: number,
        deltaTime: number,
        outAxis: Vector3
    ): number {
        // Calculate horizontal speed (ignore Y velocity for rotation)
        const speedXZ = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
        
        const MIN_ROTATION_SPEED = 0.0001;
        if (speedXZ < MIN_ROTATION_SPEED) {
            return 0;
        }
        
        // Rotation axis perpendicular to velocity direction
        // Cross product of velocity with up vector gives rotation axis
        outAxis.set(-velocity.z, 0, velocity.x);
        outAxis.normalize();
        
        // Physics formula: ω = v/r, then angle = ω × time
        // deltaTime is in milliseconds, convert to seconds
        const angularVelocity = speedXZ / radius;
        const angle = angularVelocity * (deltaTime / 1000);
        
        return -angle;
    }
}
