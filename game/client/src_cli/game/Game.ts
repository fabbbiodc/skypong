import { Scene, Vector3, Color3 } from "@babylonjs/core";
import { InputController } from "../input/InputController";
import { ClientEngine } from "./ClientEngine";
import { LocalGameState, LocalGameStateCallbacks } from "./LocalGameState";
import { GameLoop } from "./GameLoop";
import { CountdownManager } from "./CountdownManager";
import { GameReadyManager } from "./GameReadyManager";
import { LoadingManager } from "./LoadingManager";
import { adjustCamera } from "../utils/Camera";
import { GameSessionConfig } from "../types/GameSessionConfig";
import { encodeConfig } from "../utils/configDecoder";

// Module-level lock to prevent duplicate game instances (React StrictMode)
let gameInstanceLock = false;

export class Game {
  private _input: InputController | null = null;
  private _config: GameSessionConfig | null = null;
  private _onGameReady:
    | ((onLaunch: () => void, isWaitingForOpponent?: boolean) => void)
    | null = null;
  private _onBackToMenu: (() => void) | null = null;
  private _gui: any = null;
  private _isGameOver: boolean = false;
  private _isCameraFlipped: boolean = false;
  private _isPlayer2: boolean = false;
  private _clientEngine: ClientEngine | null = null;
  private _localGameState: LocalGameState | null = null;
  private _gameLoop: GameLoop | null = null;
  private _countdownManager: CountdownManager | null = null;
  private _gameReadyManager: GameReadyManager | null = null;
  private _loadingManager: LoadingManager | null = null;
  private _activeScene: Scene | null = null;
  private _winningScore: string | undefined;

  startGame = (
    canvas: HTMLCanvasElement,
    config: GameSessionConfig,
    onGameReady?: (
      onLaunch: () => void,
      isWaitingForOpponent?: boolean,
    ) => void,
    onBackToMenu?: () => void,
    onLoadingManagerReady?: (loadingManager: LoadingManager) => void,
  ) => {
    if (gameInstanceLock) return null;
    gameInstanceLock = true;

    this._config = config;
    this._winningScore = this._config.winningScore?.toString();
    this._onGameReady = onGameReady || null;
    this._onBackToMenu = onBackToMenu || null;

    const player1Name = config.playerName || "Player 1";
    const player2Name = config.player2Name || "Player 2";
    const player1Color = config.playerColor || "#00A6ED";
    const player2Color = config.player2Color || "#F6511D";
    const { gameMode } = config;

    const isAIMode = gameMode.startsWith("ai-");
    const isLocal2P = gameMode === "local-2p";
    const isLocalMode = isAIMode || isLocal2P;
    const initialPlayer2Name = isAIMode ? "AI" : player2Name;

    const onBackToMenuCallback = () => {
      if (this._onBackToMenu) {
        this._onBackToMenu();
      }
    };

    const onRetryCallback = () => {
      // console.log('[Game] Retry requested - restarting game with same config');
      // Dispose current game
      this._cleanup();
      gameInstanceLock = false;

      // Reload page with same config
      const encodedConfig = encodeConfig(config);
      window.location.href = `/game-engine/canvas?config=${encodedConfig}`;
    };

    (async () => {
      const clientEngine = new ClientEngine(canvas, config);
      this._clientEngine = clientEngine;
      const engine = clientEngine.engineSetup.engine;

      this._loadingManager = new LoadingManager({});

      if (onLoadingManagerReady) {
        onLoadingManagerReady(this._loadingManager);
      }

      const progressToPhase = (progress: number): void => {
        if (progress < 20) {
          this._loadingManager?.setPhase("initializing", progress);
        } else if (progress < 55) {
          this._loadingManager?.setPhase("loading-sky", progress);
        } else if (progress < 80) {
          this._loadingManager?.setPhase("loading-textures", progress);
        } else {
          this._loadingManager?.setPhase("preparing", progress);
        }
      };

      const entities = await clientEngine.init(
        player1Name,
        initialPlayer2Name,
        progressToPhase,
        onBackToMenuCallback,
        () => {
          this._gameLoop?.resume();
        },
        onRetryCallback,
      );
      const { ball, table, paddle, paddle2, gui, touchControls } = entities;
      this._gui = gui;

      const createScene = async () => {
        const scene = clientEngine.scene;

        try {
          // Local game mode: AI or Local 2P
          const localCallbacks: LocalGameStateCallbacks = {
            onBallUpdate: (params) => {
              this._gameLoop?.updateBallVelocity(params.vx, params.vy, params.vz);
              this._gameLoop?.setBallEnabled(params.enabled);
            },
            onPaddleUpdate: (params) => {
              this._gameLoop?.updatePaddlePosition(params.paddleIndex, params.x, params.z);
              this._gameLoop?.setPaddleEnabled(params.paddleIndex, params.enabled);
            },
            onScoreUpdate: (params) => {
              if (gui && gui.hud) {
                gui.hud.updateScores(
                  params.player1Score,
                  params.player2Score,
                  this._winningScore ?? "5"
                );
              }
            },
            onGameOver: (params) => {
              this._isGameOver = true;
              if (gui && gui.gameOverOverlay) {
                const isWinnerPlayer1 = params.winner === params.player1Name;
                gui.gameOverOverlay.show(
                  params.winner,
                  isWinnerPlayer1,
                  params.player1Score,
                  params.player2Score,
                  params.player1Name,
                  params.player2Name,
                );
              }
            },
            onPlayerNameUpdate: (params) => {
              if (gui && gui.hud) {
                gui.hud.updatePlayerNames(params.player1Name, params.player2Name);
              }
            },
            onGameStarted: () => {
              // Game started callback
            },
          };

          this._localGameState = new LocalGameState(
            ball.mesh,
            paddle.mesh,
            paddle2.mesh,
            config,
            localCallbacks,
          );

          this._countdownManager = new CountdownManager({
            onCountdownUpdate: (count) => {
              if (count > 0) {
                gui.hud.updateCountdown(count.toString());
              } else {
                gui.hud.updateCountdown("");
              }
            },
            onCountdownComplete: () => {
              if (this._localGameState) {
                this._localGameState.launch();
              }
            },
          });

          this._gameReadyManager = new GameReadyManager({
            countdownManager: this._countdownManager,
            gui,
            camera: clientEngine.engineSetup.camera,
            cameraView:
              config.cameraView ||
              (gameMode === "local-2p" ? "top-down" : "angled"),
            onGameReady: this._onGameReady ?? undefined,
          });

          const input = new InputController(scene);
          this._input = input;

          touchControls.setInputController(input);

          const gameLoopConfig = {
            engine,
            scene,
            inputController: input,
            localGameState: this._localGameState || undefined,
            ball,
            paddle,
            paddle2,
            camera: clientEngine.engineSetup.camera,
          };

          const gameLoop = new GameLoop(gameLoopConfig);
          this._gameLoop = gameLoop;

          gui.hud.showPauseButton(() => {
            gui.pauseOverlay.show();
            this._gameLoop?.pause();
          });

          gameLoop.start();

          scene.executeWhenReady(() => {
            this._gameReadyManager?.start();
          });
        } catch (e) {
          const errMsg = e instanceof Error ? e.message : String(e);
          console.error("Failed to start game:", errMsg, e);
          if (this._onBackToMenu) {
            this._onBackToMenu();
          }
        }

        return scene;
      };

      createScene().then((scene) => {
        this._activeScene = scene;
        if (this._localGameState && clientEngine) {
          clientEngine.engineSetup.engine.runRenderLoop(() => scene.render());
        }
      });
    })();

    let isDisposed = false;
    return () => {
      if (isDisposed) return;
      isDisposed = true;
      this._cleanup();
      this._activeScene?.dispose();
      this._activeScene = null;
      this._clientEngine?.engineSetup.engine.stopRenderLoop();
      this._clientEngine?.engineSetup.engine.dispose();
      gameInstanceLock = false;
    };
  };

  private _cleanup(): void {
    this._localGameState = null;
    this._input?.dispose();
    this._input = null;
    this._clientEngine?.dispose();
    this._clientEngine = null;
    this._gui = null;
    this._gameLoop?.dispose();
    this._gameLoop = null;
    this._countdownManager?.dispose();
    this._countdownManager = null;
    this._gameReadyManager?.dispose();
    this._gameReadyManager = null;
    this._loadingManager?.dispose();
    this._loadingManager = null;
    this._winningScore = undefined;
  }
}

export const startGame = (
  canvas: HTMLCanvasElement,
  config: GameSessionConfig,
  onGameReady?: (onLaunch: () => void, isWaitingForOpponent?: boolean) => void,
  onBackToMenu?: () => void,
  onLoadingManagerReady?: (loadingManager: LoadingManager) => void,
) => {
  const game = new Game();
  return game.startGame(
    canvas,
    config,
    onGameReady,
    onBackToMenu,
    onLoadingManagerReady,
  );
};
