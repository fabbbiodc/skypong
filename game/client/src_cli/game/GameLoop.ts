import { Vector3, Scene, Engine, Observer, FreeCamera } from "@babylonjs/core";
import { InputController } from "../input/InputController";
import { ClientBall } from "../entities/ClientBall";
import { ClientPaddle } from "../entities/ClientPaddle";
import { RoomManager } from "./RoomManager";
import { LocalGameState } from "./LocalGameState";
import { INTERPOLATION, NETWORK, GMCN } from "@skypong/common/constants";
import { VISUAL, CLIENT_TIMING } from "../config";

export interface GameLoopConfig {
  engine: Engine;
  scene: Scene;
  inputController: InputController;
  roomManager?: RoomManager;
  localGameState?: LocalGameState;
  ball: ClientBall;
  paddle: ClientPaddle;
  paddle2: ClientPaddle;
  camera: FreeCamera;
}

export class GameLoop {
  private _engine: Engine;
  private _scene: Scene;
  private _inputController: InputController;
  private _roomManager: RoomManager | null;
  private _localGameState: LocalGameState | null;
  private _ball: ClientBall;
  private _paddle: ClientPaddle;
  private _paddle2: ClientPaddle;
  private _camera: FreeCamera;

  private _targetPosition: Vector3 = new Vector3(0, 0, 0);
  private _targetPaddlePosition: Vector3 = new Vector3(0, 0, 0);
  private _targetPaddle2Position: Vector3 = new Vector3(0, 0, 0);

  private _isBallEnabled: boolean = true;
  private _isPaddle1Enabled: boolean = true;
  private _isPaddle2Enabled: boolean = true;
  private _isGameOver: boolean = false;
  private _isPaused: boolean = false;

  private _lastBallPosition: Vector3 = new Vector3(0, 0, 0);
  private _lastSpeedSampleAt: number = 0;
  private _lastCollisionAt: number = 0;
  private _speed: number = 0;
  private _speedUpdateCounter: number = 0;
  private _inputSendCounter: number = 0;

  // Velocity tracking for extrapolation and rotation
  private _targetVelocity: Vector3 = new Vector3(0, 0, 0);
  private _lastServerUpdateTime: number = 0;

  private _renderObserver: Observer<Scene> | null = null;
  private _renderObservable: any = null;

  constructor(config: GameLoopConfig) {
    this._engine = config.engine;
    this._scene = config.scene;
    this._inputController = config.inputController;
    this._roomManager = config.roomManager || null;
    this._localGameState = config.localGameState || null;
    this._ball = config.ball;
    this._paddle = config.paddle;
    this._paddle2 = config.paddle2;
    this._camera = config.camera;

    // Set default spawn positions until server state arrives
    // Table depth is 10, paddles are at ±4.9 (half depth - half paddle depth)
    this._targetPaddlePosition.set(
      0,
      this._paddle.mesh.position.y,
      -GMCN.TABLE.SIZE.depth / 2 + GMCN.PADDLE.SIZE.depth / 2,
    );
    this._targetPaddle2Position.set(
      0,
      this._paddle2.mesh.position.y,
      GMCN.TABLE.SIZE.depth / 2 - GMCN.PADDLE.SIZE.depth / 2,
    );
    this._targetPosition.set(0, GMCN.TABLE.Y_POSITION + GMCN.TABLE.SIZE.height / 2 + GMCN.BALL.RADIUS, 0);

    this._lastBallPosition = this._ball.mesh.position.clone();
    this._lastSpeedSampleAt = performance.now();
  }

  public updateBallPosition(x: number, y: number, z: number): void {
    if (
      x === undefined ||
      y === undefined ||
      z === undefined ||
      isNaN(x) ||
      isNaN(y) ||
      isNaN(z)
    ) {
      return;
    }
    this._targetPosition.set(x, y, z);
    this._lastServerUpdateTime = performance.now();
  }

  public updateBallVelocity(vx: number, vy: number, vz: number): void {
    if (
      vx === undefined ||
      vy === undefined ||
      vz === undefined ||
      isNaN(vx) ||
      isNaN(vy) ||
      isNaN(vz)
    ) {
      return;
    }
    this._targetVelocity.set(vx, vy, vz);
  }

  public updatePaddlePosition(paddleIndex: 1 | 2, x: number, z: number): void {
    if (x === undefined || z === undefined || isNaN(x) || isNaN(z)) {
      return;
    }
    const target =
      paddleIndex === 1
        ? this._targetPaddlePosition
        : this._targetPaddle2Position;
    const paddleObj = paddleIndex === 1 ? this._paddle : this._paddle2;
    target.set(x, paddleObj.mesh.position.y, z);
  }

  public setBallEnabled(enabled: boolean): void {
    this._isBallEnabled = enabled;
  }

  public setPaddleEnabled(paddleIndex: 1 | 2, enabled: boolean): void {
    if (paddleIndex === 1) {
      this._isPaddle1Enabled = enabled;
    } else {
      this._isPaddle2Enabled = enabled;
    }
  }

  public setGameOver(isGameOver: boolean): void {
    this._isGameOver = isGameOver;
  }

  public pause(): void {
    this._isPaused = true;
  }

  public resume(): void {
    this._isPaused = false;
  }

  public isPaused(): boolean {
    return this._isPaused;
  }

  /**
   * Mark collision event for enhanced interpolation speed
   * Called from Game.ts when server sends collision event
   */
  public notifyCollision(): void {
    this._lastCollisionAt = performance.now();
  }

  public setInitialStates(
    ballEnabled: boolean | undefined,
    paddle1Enabled: boolean | undefined,
    paddle2Enabled: boolean | undefined,
  ): void {
    this._isBallEnabled = ballEnabled ?? true;
    this._isPaddle1Enabled = paddle1Enabled ?? true;
    this._isPaddle2Enabled = paddle2Enabled ?? true;
  }

  public setupStateListeners(): void {
    if (this._roomManager) {
      const room = this._roomManager.room;
      if (!room) return;

      room.state.ball.listen("enabled", (value: boolean) => {
        this._isBallEnabled = value ?? true;
      });
      room.state.paddle.listen("enabled", (value: boolean) => {
        this._isPaddle1Enabled = value ?? true;
      });
      room.state.paddle2.listen("enabled", (value: boolean) => {
        this._isPaddle2Enabled = value ?? true;
      });
    }
  }

  public start(): void {
    this._renderObservable = this._scene.onBeforeRenderObservable;
    this._renderObserver = this._renderObservable.add(() => {
      this._update();
    });
  }

  public stop(): void {
    if (this._renderObserver && this._renderObservable) {
      this._renderObservable.remove(this._renderObserver);
    }
    this._renderObserver = null;
    this._renderObservable = null;
  }

  private _update(): void {
    if (this._isPaused) {
      return;
    }

    const deltaTime = this._engine.getDeltaTime();

    // For local game state, update physics
    if (this._localGameState) {
      const p1State = this._inputController.getPaddle1InputState();
      const p2State = this._inputController.getPaddle2InputState();
      
      // Convert key state to direction (-1, 0, 1)
      // Player 1: A/D keys (A left, D right) - same for AI and Local 2P
      const player1Input = p1State.a ? -1 : p1State.d ? 1 : 0;
      // Player 2: J/L keys (J left, L right) - only for Local 2P
      const player2Input = p2State.j ? -1 : p2State.l ? 1 : 0;
      
      this._localGameState.update(deltaTime, {
        player1Input,
        player2Input,
      });
    }

    const collisionDetected =
      performance.now() - this._lastCollisionAt <
      CLIENT_TIMING.COLLISION.WINDOW_MS;
    const now = performance.now();

    // Calculate extrapolation: predict where ball will be based on velocity
    // This compensates for network latency and reduces visual lag
    // NOTE: Server velocity is in units-per-frame, must convert to units-per-second
    const SERVER_FPS = 60; // Server physics update rate
    const timeSinceUpdate = now - this._lastServerUpdateTime;

    // During collision window, reduce extrapolation to avoid overshooting the correction
    // Outside collision window, extrapolate more aggressively up to 150ms
    const maxExtrapolation = collisionDetected ? 50 : 150; // Less aggressive during collision
    const extrapolationTime = Math.min(timeSinceUpdate, maxExtrapolation);

    const extrapolatedPosition = this._targetPosition.clone();

    // Arena bounds for wall reflection (ball center must stay within these)
    const minX = GMCN.BORDERS.LEFT_EDGE + GMCN.BALL.RADIUS;
    const maxX = GMCN.BORDERS.RIGHT_EDGE - GMCN.BALL.RADIUS;

    // Extrapolate with wall reflection: simulate bounces off side walls
    // instead of naively projecting past them (which caused "bounce away from edge" artifacts)
    if (extrapolationTime > 0) {
      const extrapolationAmount = extrapolationTime / 1000; // Convert to seconds
      // Convert velocity from units/frame to units/second by multiplying by FPS
      const vxPerSec = this._targetVelocity.x * SERVER_FPS;
      const vyPerSec = this._targetVelocity.y * SERVER_FPS;
      const vzPerSec = this._targetVelocity.z * SERVER_FPS;

      // Y and Z: no walls to reflect off, extrapolate linearly
      extrapolatedPosition.y += vyPerSec * extrapolationAmount;
      extrapolatedPosition.z += vzPerSec * extrapolationAmount;

      // X axis: simulate wall reflections (mirrors server physics)
      let newX = extrapolatedPosition.x + vxPerSec * extrapolationAmount;

      // Reflect off walls up to 3 times (handles very high speeds)
      for (let i = 0; i < 3; i++) {
        if (newX < minX) {
          newX = minX + (minX - newX);
        } else if (newX > maxX) {
          newX = maxX - (newX - maxX);
        } else {
          break; // Within bounds, done
        }
      }

      extrapolatedPosition.x = newX;
    }

    // Safety clamp: ensure extrapolated position never exceeds arena bounds
    extrapolatedPosition.x = Math.max(
      minX,
      Math.min(maxX, extrapolatedPosition.x),
    );

    if (
      ++this._speedUpdateCounter >= NETWORK.SYNC.SPEED_UPDATE_INTERVAL_FRAMES
    ) {
      const elapsed = (now - this._lastSpeedSampleAt) / 1000;
      this._speed =
        elapsed > 0
          ? Vector3.Distance(this._ball.mesh.position, this._lastBallPosition) /
            elapsed
          : 0;
      this._lastBallPosition.copyFrom(this._ball.mesh.position);
      this._lastSpeedSampleAt = now;
      this._speedUpdateCounter = 0;
    }

    const ballSmoothingSpeed = collisionDetected
      ? INTERPOLATION.COLLISION_SPEED
      : INTERPOLATION.DEFAULT_SPEED;
    const paddleSmoothingSpeed = VISUAL.SMOOTHING.PADDLE_LERP_SPEED;

    // Near-wall boost: tighter visual tracking when ball is close to wall boundaries
    // Reduces the visual gap between render position and actual position at bounce time
    const distToWall = Math.min(
      Math.abs(extrapolatedPosition.x - minX),
      Math.abs(extrapolatedPosition.x - maxX),
    );
    const nearWallBoost = distToWall < 0.3 ? 1.5 : 1.0;

    const ballLerpFactor =
      1 - Math.exp(-ballSmoothingSpeed * nearWallBoost * (deltaTime / 1000));
    const paddleLerpFactor =
      1 - Math.exp(-paddleSmoothingSpeed * (deltaTime / 1000));

    // Pass extrapolated position and velocity to ball
    this._ball.update(
      extrapolatedPosition,
      ballLerpFactor,
      this._isBallEnabled,
      deltaTime,
      this._targetVelocity,
    );
    this._paddle.update(
      this._targetPaddlePosition,
      paddleLerpFactor,
      this._isPaddle1Enabled,
    );
    this._paddle2.update(
      this._targetPaddle2Position,
      paddleLerpFactor,
      this._isPaddle2Enabled,
    );

    if (
      ++this._inputSendCounter >= NETWORK.SYNC.INPUT_SEND_INTERVAL_FRAMES &&
      !this._isGameOver &&
      this._roomManager
    ) {
      this._roomManager.sendInput({
        paddle1: this._inputController.getPaddle1InputState(),
        paddle2: this._inputController.getPaddle2InputState(),
      });
      this._inputSendCounter = 0;
    }
  }

  public dispose(): void {
    this.stop();
    this._targetPosition = new Vector3(0, 0, 0);
    this._targetPaddlePosition = new Vector3(0, 0, 0);
    this._targetPaddle2Position = new Vector3(0, 0, 0);
  }
}
