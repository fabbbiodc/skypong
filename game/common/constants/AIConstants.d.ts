/**
 * AI difficulty configurations and behavior constants
 * Used by AIPaddleController on the server
 */
export declare const AI_DIFFICULTY: {
    readonly EASY: {
        readonly REACTION_DELAY_FRAMES: 37;
        readonly MAX_SPEED_MULTIPLIER: 0.55;
        readonly ACCURACY: 0.146;
        readonly PREDICTION_FACTOR: 0.0366;
        readonly ERROR_FREQUENCY: 0.222;
        readonly DEGRADATION_TICK_INTERVAL: 659;
    };
    readonly MEDIUM: {
        readonly REACTION_DELAY_FRAMES: 23;
        readonly MAX_SPEED_MULTIPLIER: 0.55;
        readonly ACCURACY: 0.308;
        readonly PREDICTION_FACTOR: 0.077;
        readonly ERROR_FREQUENCY: 0.140;
        readonly DEGRADATION_TICK_INTERVAL: 924;
    };
    readonly HARD: {
        readonly REACTION_DELAY_FRAMES: 14;
        readonly MAX_SPEED_MULTIPLIER: 0.75;
        readonly ACCURACY: 0.508;
        readonly PREDICTION_FACTOR: 0.347;
        readonly ERROR_FREQUENCY: 0.082;
        readonly DEGRADATION_TICK_INTERVAL: 1502;
    };
};
export declare const AI_BEHAVIOR: {
    readonly VELOCITY_FALLBACK: 0.1;
    readonly MOVEMENT_THRESHOLD: 0.1;
    readonly ERROR_MULTIPLIER: 2.0;
    readonly SPEED_CALCULATION: {
        readonly MIN_FACTOR: 0.5;
        readonly MAX_FACTOR: 1;
    };
    readonly DEGRADATION: {
        readonly ERROR_FREQ_BOOST_PER_LEVEL: 0.2;
        readonly ACCURACY_PENALTY_PER_LEVEL: 0.05;
        readonly RESET_CARRY_FACTOR: 0.5;
        readonly MAX_LEVEL: 10;
        readonly MIN_ACCURACY: 0.1;
    };
};
