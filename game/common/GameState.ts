import { Schema, type } from "@colyseus/schema";
import { SCORING } from "./constants/ScoringConstants.js";

export class BallState extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;

  // Ball velocity (for client-side extrapolation and accurate rotation)
  @type("number") vx: number = 0;
  @type("number") vy: number = 0;
  @type("number") vz: number = 0;

  @type("number") timestamp: number = 0;
  @type("boolean") enabled: boolean = true;

  // New fields for collision handling (used for both paddle and border collisions)
  @type("number") lastImpactX: number = 0;
  @type("number") lastImpactZ: number = 0;
  @type("number") collisionCount: number = 0;
  @type("number") collisionTime: number = 0; // Server timestamp when collision occurred
}

export class PaddleState extends Schema {
  @type("number") x: number = 0;
  @type("number") z: number = 0;
  @type("number") y: number = 0;
  @type("boolean") enabled: boolean = true;
}

export class MyGameState extends Schema {
  // Ball and paddles
  @type(BallState) ball = new BallState();
  @type(PaddleState) paddle = new PaddleState();
  @type(PaddleState) paddle2 = new PaddleState();

  // Player identification
  @type("string") player1Id: string = "";
  @type("string") player2Id: string = "";
  @type("string") player1Name: string = "Player 1";
  @type("string") player2Name: string = "Player 2";
  @type("string") player1Color: string = "#00A6ED";
  @type("string") player2Color: string = "#F6511D";

  // Scoring
  @type("number") player1Score: number = 0;
  @type("number") player2Score: number = 0;
  @type("number") winningScore: number = SCORING.DEFAULT_WINNING_SCORE;

  // Game state
  @type("string") winner: string = ""; // SessionId of winner, empty if no winner
  @type("boolean") gameOver: boolean = false;
  @type("boolean") gameStarted: boolean = false;
  @type("boolean") isPaused: boolean = false;

  // Client readiness (for loading sync in PvP)
  @type("boolean") player1Ready: boolean = false;
  @type("boolean") player2Ready: boolean = false;

  // Player 2 joined flag (to know when both player colors are set)
  @type("boolean") player2Joined: boolean = false;
}
