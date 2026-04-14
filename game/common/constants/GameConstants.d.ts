/**
 * Unified game configuration shared across the project
 * These values should be used consistently in both client and server
 */
export declare const GMCN: {
    TABLE: {
        SIZE: {
            width: number;
            depth: number;
            height: number;
        };
        Y_POSITION: number;
    };
    BALL: {
        DIAMETER: number;
        RADIUS: number;
    };
    GROUND: {
        WIDTH: number;
        LENGTH: number;
    };
    PHYSICS: {
        /** Ball movement speed */
        BALL_MOVE_SPEED: number;
        SERVE_VELOCITY_Z: number;
    };
    PADDLE: {
        SIZE: {
            width: number;
            depth: number;
            height: number;
        };
        SPEED: number;
    };
    BORDERS: {
        LEFT_EDGE: number;
        RIGHT_EDGE: number;
    };
};
