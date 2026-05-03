import { CountdownManager } from "./CountdownManager";
import { FreeCamera } from "@babylonjs/core";
import { animateCameraIntro } from "../utils/Camera";

export interface GameReadyManagerConfig {
  countdownManager: CountdownManager;
  gui: any;
  camera: FreeCamera;
  cameraView: "angled" | "top-down";
  onGameReady?: (
    onLaunch: () => void,
    isWaitingForOpponent?: boolean,
  ) => void | null;
}

export class GameReadyManager {
  private _countdownManager: CountdownManager;
  private _gui: any;
  private _isWaitingForOpponent: boolean = false;
  private _onGameReady:
    | ((onLaunch: () => void, isWaitingForOpponent?: boolean) => void)
    | undefined;
  private _savedLaunchCallback: (() => void) | null = null;
  private _hasLaunched: boolean = false;
  private _camera: FreeCamera;
  private _cameraView: "angled" | "top-down";

  constructor(config: GameReadyManagerConfig) {
    this._countdownManager = config.countdownManager;
    this._gui = config.gui;
    this._onGameReady = config.onGameReady ?? undefined;
    this._camera = config.camera;
    this._cameraView = config.cameraView;
  }

  public start(): void {
    const launchCallback = () => this._startCountdown();

    if (this._onGameReady) {
      const cb = this._onGameReady;
      this._onGameReady = undefined;
      cb(launchCallback, false);
    } else {
      launchCallback();
    }
  }

  public triggerCountdown(): void {
    this._startCountdown();
  }

  public dispose(): void {
    this._onGameReady = undefined;
    this._savedLaunchCallback = null;
  }

  private _startCountdown(): void {
    if (this._hasLaunched) return;
    this._hasLaunched = true;

    animateCameraIntro(this._camera, this._cameraView, false, () => {
      this._countdownManager.start();
    });
  }
}
