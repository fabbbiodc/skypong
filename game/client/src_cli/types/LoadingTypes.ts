export type LoadingPhase =
  | "initializing"
  | "connecting"
  | "waiting-for-opponent"
  | "ready"
  | "starting"
  | "error";

export type ErrorCode =
  | "connection-failed"
  | "room-expired"
  | "configuration-invalid"
  | "unknown";

export interface LoadingState {
  phase: LoadingPhase;
  message: string;
  error: { code: ErrorCode; details?: string } | null;
  isFadingOut: boolean;
}

export const INITIAL_LOADING_STATE: LoadingState = {
  phase: "initializing",
  message: "Loading...",
  error: null,
  isFadingOut: false,
};

export const PHASE_MESSAGES: Record<LoadingPhase, string> = {
  initializing: "Initializing display...",
  connecting: "Connecting to server...",
  "waiting-for-opponent": "Waiting for opponent...",
  ready: "Ready!",
  starting: "Starting game...",
  error: "An error occurred",
};
