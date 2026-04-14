import { Schema } from "@colyseus/schema";
export declare class BallState extends Schema {
    x: number;
    y: number;
    z: number;
    timestamp: number;
    enabled: boolean;
    lastImpactX: number;
    lastImpactZ: number;
    collisionCount: number;
    collisionTime: number;
}
export declare class PaddleState extends Schema {
    x: number;
    z: number;
    y: number;
    enabled: boolean;
}
export declare class MyGameState extends Schema {
    ball: BallState;
    paddle: PaddleState;
    paddle2: PaddleState;
    player1Id: string;
    player2Id: string;
    player1Name: string;
    player2Name: string;
    player1Color: string;
    player2Color: string;
    player1Score: number;
    player2Score: number;
    winningScore: number;
    winner: string;
    gameOver: boolean;
    gameStarted: boolean;
    isPaused: boolean;
    player1Ready: boolean;
    player2Ready: boolean;
    player2Joined: boolean;
}
