import { RoomManager } from "./RoomManager";
import {
  LoadingPhase,
  LoadingState,
  ErrorCode,
  INITIAL_LOADING_STATE,
  PHASE_MESSAGES,
} from "../types/LoadingTypes";

export interface LoadingManagerConfig {
  roomManager: RoomManager;
  isOnline: boolean;
  isPvP: boolean;
}

export type StateChangeCallback = (state: LoadingState) => void;

export class LoadingManager {
  private _roomManager: RoomManager;
  private _isOnline: boolean;
  private _isPvP: boolean;
  private _state: LoadingState;
  private _callbacks: StateChangeCallback[] = [];
  private _hasLaunched: boolean = false;
  private _waitingForOpponent: boolean = false;

  constructor(config: LoadingManagerConfig) {
    this._roomManager = config.roomManager;
    this._isOnline = config.isOnline;
    this._isPvP = config.isPvP;
    this._state = { ...INITIAL_LOADING_STATE };
  }

  public start(initialGameStarted: boolean): void {
    this._setPhase("connecting");

    if (this._isOnline) {
      this._roomManager.signalClientReady();
    }

    const shouldWaitForOpponent = this._isPvP && !initialGameStarted;
    this._waitingForOpponent = shouldWaitForOpponent;

    if (shouldWaitForOpponent) {
      this._setPhase("waiting-for-opponent");
    } else {
      this._setPhase("ready");
    }
  }

  public getState(): LoadingState {
    return { ...this._state };
  }

  public onStateChange(callback: StateChangeCallback): void {
    this._callbacks.push(callback);
    callback(this._state);
  }

  public removeCallback(callback: StateChangeCallback): void {
    const index = this._callbacks.indexOf(callback);
    if (index > -1) {
      this._callbacks.splice(index, 1);
    }
  }

  public triggerLaunch(): void {
    if (this._hasLaunched || this._state.phase === "error") return;
    this._hasLaunched = true;
    this._setPhase("starting");
  }

  public handleGameStarted(): void {
    if (this._waitingForOpponent) {
      this._waitingForOpponent = false;
      this._setPhase("ready");
    }
  }

  public handleRoomExpired(): void {
    this._setError("room-expired", "No opponent joined within 2 minutes.");
  }

  public handleConnectionError(details?: string): void {
    this._setError("connection-failed", details);
  }

  public handleConfigError(): void {
    this._setError("configuration-invalid", "No game configuration provided");
  }

  public dispose(): void {
    this._callbacks = [];
    this._hasLaunched = false;
    this._waitingForOpponent = false;
  }

  private _setPhase(phase: LoadingPhase): void {
    this._state = {
      ...this._state,
      phase,
      message: PHASE_MESSAGES[phase],
      error: null,
    };
    this._notifyStateChange();
  }

  private _setError(code: ErrorCode, details?: string): void {
    this._state = {
      ...this._state,
      phase: "error",
      message: "",
      error: { code, details },
    };
    this._notifyStateChange();
  }

  private _notifyStateChange(): void {
    const stateCopy = { ...this._state };
    this._callbacks.forEach((cb) => cb(stateCopy));
  }
}
