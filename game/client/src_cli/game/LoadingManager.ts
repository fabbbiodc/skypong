import {
  LoadingPhase,
  LoadingState,
  ErrorCode,
  INITIAL_LOADING_STATE,
  PHASE_MESSAGES,
} from "../types/LoadingTypes";

export interface LoadingManagerConfig {}

export type StateChangeCallback = (state: LoadingState) => void;

export class LoadingManager {
  private _state: LoadingState;
  private _callbacks: StateChangeCallback[] = [];

  constructor(config: LoadingManagerConfig) {
    this._state = { ...INITIAL_LOADING_STATE };
  }

  public start(): void {
    this._setPhase("ready");
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

  public setPhase(phase: LoadingPhase, progress?: number): void {
    if (this._state.phase === "error") return;
    this._state = {
      ...this._state,
      phase,
      message: PHASE_MESSAGES[phase],
      error: null,
      progress: progress !== undefined ? progress : this._state.progress,
    };
    this._notifyStateChange();
  }

  public setProgress(progress: number): void {
    if (this._state.phase === "error") return;
    this._state = {
      ...this._state,
      progress: Math.min(100, Math.max(0, progress)),
    };
    this._notifyStateChange();
  }

  public triggerLaunch(): void {
    if (this._state.phase === "error") return;
    this._setPhase("starting");
  }

  public handleConnectionError(details?: string): void {
    this._setError("connection-failed", details);
  }

  public handleConfigError(): void {
    this._setError("configuration-invalid", "No game configuration provided");
  }

  public dispose(): void {
    this._callbacks = [];
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
