export type LoadingPhase =
  | "initializing"
  | "loading-sky"
  | "loading-textures"
  | "preparing"
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
  progress: number;
  error: { code: ErrorCode; details?: string } | null;
  isFadingOut: boolean;
}

export const INITIAL_LOADING_STATE: LoadingState = {
  phase: "initializing",
  message: "Initializing display...",
  progress: 0,
  error: null,
  isFadingOut: false,
};

export const PHASE_MESSAGES: Record<LoadingPhase, string> = {
  initializing: "Initializing display...",
  "loading-sky": "Loading sky...",
  "loading-textures": "Loading textures...",
  preparing: "Preparing game...",
  ready: "Ready!",
  starting: "Starting game...",
  error: "An error occurred",
};
