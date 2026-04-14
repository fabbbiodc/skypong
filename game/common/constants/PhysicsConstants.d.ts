/**
 * Physics constants shared between client and server
 * Server uses these for authoritative physics calculations
 * Client uses these for visual effects and predictions
 */
export declare const PHYSICS: {
    readonly GRAVITY: -0.01;
    readonly BALL: {
        readonly BOUNCE_RESTITUTION: 1;
        readonly FRICTION: 0;
        readonly MASS: 1;
        readonly MAX_SPEED: 1;
    };
    readonly PADDLE: {
        readonly BOUNCE_RESTITUTION: 1;
        readonly FRICTION: 0;
        readonly MASS: 1;
    };
    readonly COLLISION: {
        readonly MAX_DISTANCE_SQ: 4;
        readonly PADDLE_OFFSET: 0;
        /** Threshold for paddle collision detection */
        readonly PADDLE_COLLISION_THRESHOLD: 0.1;
    };
    readonly RESPAWN: {
        readonly DELAY_MS: 1000;
        readonly FALL_THRESHOLD: -5;
    };
    /** Physics response parameters for collisions and ball behavior */
    readonly RESPONSE: {
        /** Speed boost multiplier when ball bounces off walls */
        readonly WALL_SPEED_BOOST: 1.02;
        /** Maximum bounce angle in degrees when ball hits paddle edge */
        readonly MAX_BOUNCE_ANGLE_DEG: 70;
        /** Speed multiplier for edge hits on paddle (0.2 = 20% speed increase at edges) */
        readonly EDGE_SPEED_MULTIPLIER: 0.2;
    };
    /** Ball launch parameters for serving */
    readonly LAUNCH: {
        /** Minimum angle from Z axis (degrees) */
        readonly MIN_ANGLE_DEG: 10;
        /** Maximum angle from Z axis (degrees) */
        readonly MAX_ANGLE_DEG: 45;
        /** Base speed magnitude */
        readonly BASE_SPEED: 0.07;
    };
};
export declare const INTERPOLATION: {
    readonly DEFAULT_SPEED: 18;
    readonly COLLISION_SPEED: 35;
    readonly PADDLE_SPEED: 0.1;
    readonly BOUNCE: {
        readonly MIN_SPEED: 0.012;
        readonly MAX_SPEED: 0.035;
        readonly MIN_DISTANCE: 0.03;
    };
};
export declare const SYNC: {
    readonly MAX_DEVIATION: 0.25;
    readonly COLLISION_EXPIRY_MS: 100;
    readonly MAX_BOUNCE_DURATION_MS: 80;
    readonly SKIP_BOUNCE_THRESHOLD: 0.4;
    readonly HIGH_SPEED_THRESHOLD: 0.7;
};
