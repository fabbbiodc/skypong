import { Room, Client } from "colyseus";
import { NullEngine, Scene, Vector3, UniversalCamera } from "@babylonjs/core";
import { MyGameState } from "@skypong/common/GameState";
import { ServerBall } from "../entities/ServerBall";
import { ServerPaddle } from "../entities/ServerPaddle";
import { ServerTable } from "../entities/ServerTable";
import { InputManager } from "../input/InputManager";
import { PhysicsEngine } from "../physics";
import { SERVER_CONFIG, ROOM_CONFIG, Logger } from "../config";

export class GameRoom extends Room<MyGameState> {
    public engine!: NullEngine;
    public scene!: Scene;
    public serverBall!: ServerBall;
    public serverPaddle!: ServerPaddle;
    public serverPaddle2!: ServerPaddle;
    public serverTable!: ServerTable;
    public inputManager!: InputManager;
    public physicsEngine!: PhysicsEngine;
    private hadPaddleCollision: boolean = false;
    private hadPaddle2Collision: boolean = false;
    private lastBorderDirection: number = 0;
    private paddleFrontZOffset: number = ROOM_CONFIG.PADDLE_FRONT_OFFSET;
    private ballLaunched: boolean = false;
    private goalScoredThisRound: boolean = false;
    private player1Client: Client | null = null;
    private player2Client: Client | null = null;

    onCreate(options: any): void | Promise<any> {
        this.setState(new MyGameState());
        if (options.winningScore) {
            this.state.winningScore = options.winningScore;
        }
        this.engine = new NullEngine();
        this.scene = new Scene(this.engine);
        this.physicsEngine = new PhysicsEngine(this.scene);

        const camera = new UniversalCamera(
            "serverCamera",
            new Vector3(0, 0, 0),
            this.scene,
        );

        this.serverTable = new ServerTable(this.scene);
        this.serverBall = new ServerBall(this.scene, this.physicsEngine);
        this.serverPaddle = new ServerPaddle(this.scene, this.physicsEngine, false);
        this.serverPaddle2 = new ServerPaddle(this.scene, this.physicsEngine, true);
        this.inputManager = new InputManager();

        // Do NOT launch ball immediately - wait for client "launch" message
        this.ballLaunched = false;

        // Auto-dispose room when all clients leave (fresh start on refresh)
        this.autoDispose = true;

        this.onMessage("input", (client, data) => {
            // Reject inputs if game is over
            if (this.state.gameOver) {
                return;
            }
            this.inputManager.setInput(client.sessionId, data);
        });

        // Handle launch message from client (when countdown completes)
        this.onMessage("launch", (client, data) => {
            if (!this.ballLaunched) {
                this.serverBall.launch(this.physicsEngine);
                this.ballLaunched = true;
                this.goalScoredThisRound = false; // Reset goal flag on new launch
            }
        });

        // Handle pause/resume from client
        this.onMessage("pause", (client, data) => {
            this.state.isPaused = true;
        });

        this.onMessage("resume", (client, data) => {
            this.state.isPaused = false;
        });

        this.setSimulationInterval((deltaTime) => {
            this.update(deltaTime);
        }, SERVER_CONFIG.SIMULATION_INTERVAL_MS);
    }

    update(deltaTime: number) {
        // Skip updates if game is over or paused
        if (this.state.gameOver || this.state.isPaused) {
            return;
        }

        const moveVector = this.inputManager.getMovementVector();
        const paddle2Move = this.inputManager.getPaddle2Movement();

        if (moveVector.x !== 0) {
            const direction = moveVector.x > 0 ? 1 : -1;
            this.serverPaddle.move(direction, this.physicsEngine);
        }

        // Invert controls for player 2 to match camera
        if (paddle2Move !== 0) {
            this.serverPaddle2.move(-paddle2Move, this.physicsEngine);
        }

        this.serverBall.update(deltaTime, this.physicsEngine);
        this.physicsEngine.clampBallToTable(this.serverBall.physicsBody);

        const borderCollision = this.physicsEngine.checkBallBorderCollision(
            this.serverBall.physicsBody
        );

        if (borderCollision.hasCollision && this.lastBorderDirection === 0) {
            this.physicsEngine.resolveBallBorderCollision(this.serverBall.physicsBody, borderCollision);
            const ballPosition = this.serverBall.getPosition();
            this.state.ball.lastImpactX = borderCollision.collisionX;
            this.state.ball.lastImpactZ = ballPosition.z;
            this.state.ball.collisionCount++;
            this.state.ball.collisionTime = Date.now();
        }

        this.lastBorderDirection = borderCollision.borderDirection;

        const collision1 = this.physicsEngine.checkBallPaddleCollision(
            this.serverBall.physicsBody,
            this.serverPaddle.physicsBody,
            this.paddleFrontZOffset
        );

        const collision2 = this.physicsEngine.checkBallPaddleCollision(
            this.serverBall.physicsBody,
            this.serverPaddle2.physicsBody,
            -this.paddleFrontZOffset
        );

        if (collision1.hasCollision && !this.hadPaddleCollision) {
            // Get ball position BEFORE resolving collision (actual impact position)
            const ballPosition = this.serverBall.getPosition();
            this.physicsEngine.resolveBallPaddleCollision(
                this.serverBall.physicsBody,
                this.serverPaddle.physicsBody,
                collision1.impactX
            );
            // Use actual ball position at collision time, not paddle face
            this.state.ball.lastImpactX = ballPosition.x;
            this.state.ball.lastImpactZ = ballPosition.z;
            this.state.ball.collisionCount++;
            this.state.ball.collisionTime = Date.now();
        }

        if (collision2.hasCollision && !this.hadPaddle2Collision) {
            // Get ball position BEFORE resolving collision (actual impact position)
            const ballPosition = this.serverBall.getPosition();
            this.physicsEngine.resolveBallPaddleCollision(
                this.serverBall.physicsBody,
                this.serverPaddle2.physicsBody,
                collision2.impactX
            );
            // Use actual ball position at collision time, not paddle face
            this.state.ball.lastImpactX = ballPosition.x;
            this.state.ball.lastImpactZ = ballPosition.z;
            this.state.ball.collisionCount++;
            this.state.ball.collisionTime = Date.now();
        }

        this.hadPaddleCollision = collision1.hasCollision;
        this.hadPaddle2Collision = collision2.hasCollision;

        // Check for goals (ball passed paddle)
        this.checkForGoal();

        // Reset goal flag if ball is back in play (respawned)
        if (this.goalScoredThisRound && this.serverBall.isEnabled() && !this.serverBall.isInFall()) {
            const ballZ = this.serverBall.getPosition().z;
            // Ball is back within table bounds
            if (Math.abs(ballZ) < ROOM_CONFIG.GOAL_THRESHOLD) {
                this.goalScoredThisRound = false;
                Logger.debug(`Goal flag reset - ball back in play at z=${ballZ.toFixed(2)}`);
            }
        }

        // Sync ball state - use actual enabled state from ball
        this.state.ball.enabled = this.serverBall.isEnabled();
        if (this.state.ball.enabled) {
            const ballPosition = this.serverBall.getPosition();
            this.state.ball.x = ballPosition.x;
            this.state.ball.y = ballPosition.y;
            this.state.ball.z = ballPosition.z;
            
            // Sync velocity for client-side extrapolation and accurate rotation
            const velocity = this.serverBall.physicsBody.velocity;
            this.state.ball.vx = velocity.x;
            this.state.ball.vy = velocity.y;
            this.state.ball.vz = velocity.z;
        }

        this.state.paddle.enabled = this.serverPaddle.isEnabled();
        if (this.state.paddle.enabled) {
            const paddlePosition = this.serverPaddle.getPosition();
            this.state.paddle.x = paddlePosition.x;
            this.state.paddle.z = paddlePosition.z;
        }

        this.state.paddle2.enabled = this.serverPaddle2.isEnabled();
        if (this.state.paddle2.enabled) {
            const paddle2Position = this.serverPaddle2.getPosition();
            this.state.paddle2.x = paddle2Position.x;
            this.state.paddle2.z = paddle2Position.z;
        }
    }

    /**
     * Check if ball passed a paddle (goal scored)
     * Ball is at z = -5 (near side, paddle1) to z = 5 (far side, paddle2)
     * If ball.z > 5.5: Player 1 scores (ball passed paddle2)
     * If ball.z < -5.5: Player 2 scores (ball passed paddle1)
     */
    private checkForGoal(): void {
        const ballZ = this.serverBall.getPosition().z;

        // Debug logging to trace goal detection
        if (Math.abs(ballZ) > 4.5) {
            Logger.debug(`checkForGoal: ballZ=${ballZ.toFixed(2)}, gameOver=${this.state.gameOver}, ballLaunched=${this.ballLaunched}, ballEnabled=${this.serverBall.isEnabled()}, goalScored=${this.goalScoredThisRound}, threshold=${ROOM_CONFIG.GOAL_THRESHOLD}`);
        }

        // Skip if game is over or ball hasn't been launched
        if (this.state.gameOver || !this.ballLaunched) {
            if (Math.abs(ballZ) > 4.5) {
                Logger.debug(`Skipping goal check: gameOver or not launched`);
            }
            return;
        }

        // Skip if goal already scored this round (prevents multiple detections)
        if (this.goalScoredThisRound) {
            return;
        }

        // Only detect goal if ball is enabled
        if (!this.serverBall.isEnabled()) {
            if (Math.abs(ballZ) > 4.5) {
                Logger.debug(`Skipping goal check: ball disabled`);
            }
            return;
        }

        // Check if ball passed paddle2 (far side, positive Z)
        // Player 1 scores
        if (ballZ > ROOM_CONFIG.GOAL_THRESHOLD) {
            Logger.goal(`Player 1 scores! ballZ=${ballZ.toFixed(2)} > threshold=${ROOM_CONFIG.GOAL_THRESHOLD}`);
            this.goalScoredThisRound = true;
            this.awardPoint(1);
            return;
        }

        // Check if ball passed paddle1 (near side, negative Z)
        // Player 2 scores
        if (ballZ < -ROOM_CONFIG.GOAL_THRESHOLD) {
            Logger.goal(`Player 2 scores! ballZ=${ballZ.toFixed(2)} < -threshold=${-ROOM_CONFIG.GOAL_THRESHOLD}`);
            this.goalScoredThisRound = true;
            this.awardPoint(2);
            return;
        }
    }

    /**
     * Award a point to the specified player and check for winner
     * @param playerNum - 1 for player 1, 2 for player 2
     */
    private awardPoint(playerNum: number): void {
        if (playerNum === 1) {
            this.state.player1Score++;
            Logger.info(`Goal! Player 1 (${this.state.player1Name}) scores! Score: ${this.state.player1Score}-${this.state.player2Score}`);
        } else {
            this.state.player2Score++;
            Logger.info(`Goal! Player 2 (${this.state.player2Name}) scores! Score: ${this.state.player1Score}-${this.state.player2Score}`);
        }

        // Check for winner
        this.checkForWinner();

        // Don't reset ball immediately - let it fall naturally
        // The ball will auto-respawn after falling below threshold (y = -5)
        // This preserves the visual effect of the ball falling off the table
    }

    /**
     * Check if a player has won the game
     */
    private checkForWinner(): void {
        const winningScore = this.state.winningScore;

        if (this.state.player1Score >= winningScore) {
            this.state.winner = this.state.player1Id;
            this.state.gameOver = true;
            this.serverBall.setGameOver(true);
            this.serverBall.setEnabled(false);
            Logger.gameOver(`Winner: ${this.state.player1Name} (${this.state.player1Score}-${this.state.player2Score})`);
        } else if (this.state.player2Score >= winningScore) {
            this.state.winner = this.state.player2Id;
            this.state.gameOver = true;
            this.serverBall.setGameOver(true);
            this.serverBall.setEnabled(false);
            Logger.gameOver(`Winner: ${this.state.player2Name} (${this.state.player1Score}-${this.state.player2Score})`);
        }
    }

    onJoin(client: Client, options: any): void | Promise<any> {

        const isLocal2P = options.player2Name && options.player2Name !== '';

        // Assign player slots
        if (!this.player1Client) {
            this.player1Client = client;
            this.state.player1Id = options.playerId || client.sessionId;
            this.state.player1Name = options.playerName || "Player 1";
            this.state.player1Color = options.playerColor || "#00A6ED";
            Logger.info(`Player 1 joined: ${this.state.player1Id} (${this.state.player1Name}, color: ${this.state.player1Color})`);

            // local 2P mode
            if (isLocal2P) {
                this.state.player2Id = options.player2Id || "local_p2";
                this.state.player2Name = options.player2Name;
                this.state.player2Color = options.player2Color || "#F6511D";
                Logger.info(`Local Player 2 configured: ${this.state.player2Name} (${this.state.player2Id}), color: ${this.state.player2Color}`);
                this.state.gameStarted = true;
            }
        } else if (!this.player2Client) {
            this.player2Client = client;
            this.state.player2Id = options.playerId || client.sessionId;
            this.state.player2Name = options.playerName || "Player 2";
            this.state.player2Color = options.playerColor || "#F6511D";
            Logger.info(`Player 2 joined: ${this.state.player2Id} (${this.state.player2Name}, color: ${this.state.player2Color})`);
            // Start the game when second player joins
            this.state.gameStarted = true;
        } else {
            // Room is full
            throw new Error("Room is full");
        }
    }

    onLeave(client: Client, consented: boolean): void | Promise<any> {
        Logger.info(`Client left: ${client.sessionId} (consented: ${consented})`);

        if (this.player1Client?.sessionId === client.sessionId) {
            this.player1Client = null;
            this.state.player1Id = "";
            // If game was in progress, player 2 wins by forfeit
            if (this.state.gameStarted && !this.state.gameOver) {
                this.state.winner = this.state.player2Id;
                this.state.gameOver = true;
            }
        } else if (this.player2Client?.sessionId === client.sessionId) {
            this.player2Client = null;
            this.state.player2Id = "";
            // If game was in progress, player 1 wins by forfeit
            if (this.state.gameStarted && !this.state.gameOver) {
                this.state.winner = this.state.player1Id;
                this.state.gameOver = true;
            }
        }

        // If both players have left, dispose the room (after short delay)
        if (!this.player1Client && !this.player2Client) {
            Logger.info(`[GameRoom] All players left, disposing room`);
            setTimeout(() => {
                this.disconnect().then(() => {
                    Logger.info(`[GameRoom] Room disposed`);
                });
            }, ROOM_CONFIG.DISPOSAL_DELAY_MS);
        }
    }

    onDispose(): void | Promise<any> {
        this.inputManager.clear();
        this.engine.dispose();
    }
}
