import { Scene, Vector3, Color3 } from "@babylonjs/core";
import { InputController } from "../input/InputController";
import { ClientEngine } from "./ClientEngine";
import { RoomManager, RoomManagerCallbacks } from "./RoomManager";
import { LocalGameState, LocalGameStateCallbacks } from "./LocalGameState";
import { GameLoop } from "./GameLoop";
import { CountdownManager } from "./CountdownManager";
import { GameReadyManager } from "./GameReadyManager";
import { LoadingManager } from "./LoadingManager";
import { adjustCamera } from "../utils/Camera";
import { GameSessionConfig } from "../types/GameSessionConfig";
import { LoadingState } from "../types/LoadingTypes";
import { encodeConfig } from "../utils/configDecoder";

// Module-level lock to prevent duplicate game instances (React StrictMode)
let gameInstanceLock = false;

export class Game {
  private _input: InputController | null = null;
  private _room: any = null;
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
  private _roomManager: RoomManager | null = null;
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

    const isPvPMode =
      gameMode === "online-create" ||
      gameMode === "online-join";
    const isAIMode = gameMode.startsWith("ai-");
    const isLocal2P = gameMode === "local-2p";
    const isLocalMode = isAIMode || isLocal2P;
    const initialPlayer2Name = isPvPMode
      ? "Waiting..."
      : isAIMode
        ? "AI"
        : player2Name;

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

      const entities = await clientEngine.init(
        player1Name,
        initialPlayer2Name,
        onBackToMenuCallback,
        () => {
          this._gameLoop?.resume();
          this._roomManager?.sendResume();
        },
        onRetryCallback,
      );
      const { ball, table, paddle, paddle2, gui, touchControls } = entities;
      this._gui = gui;

      const createScene = async () => {
        const scene = clientEngine.scene;

        try {
          const isOnlineMode =
            gameMode === "online-create" || gameMode === "online-join";

          // Create LocalGameState for local modes or RoomManager for online
          if (isLocalMode) {
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
          } else {
            // Online game mode: use RoomManager
            const roomManager = new RoomManager(
              this._createRoomManagerCallbacks(
                clientEngine,
                table,
                paddle,
                paddle2,
                ball,
                gui,
              ),
            );

            this._roomManager = roomManager;
            const room = await roomManager.connect(
              gameMode,
              config,
              config.roomId,
            );
            this._room = room;
          }

          this._countdownManager = new CountdownManager({
            onCountdownUpdate: (count) => {
              if (count > 0) {
                gui.hud.updateCountdown(count.toString());
              } else {
                gui.hud.updateCountdown("");
              }
            },
            onCountdownComplete: () => {
              if (this._roomManager) {
                this._roomManager.sendLaunch();
              } else if (this._localGameState) {
                this._localGameState.launch();
              }
            },
          });

          this._gameReadyManager = new GameReadyManager({
            roomManager: this._roomManager || undefined,
            countdownManager: this._countdownManager,
            gui,
            isPvP: isPvPMode,
            isOnline: isOnlineMode,
            initialGameStarted: this._room?.state?.gameStarted ?? false,
            camera: clientEngine.engineSetup.camera,
            cameraView:
              config.cameraView ||
              (gameMode === "local-2p" ? "top-down" : "angled"),
            onGameReady: this._onGameReady ?? undefined,
          });

          this._loadingManager = new LoadingManager({
            roomManager: this._roomManager || undefined,
            isOnline: isOnlineMode,
            isPvP: isPvPMode,
          });

          if (onLoadingManagerReady) {
            onLoadingManagerReady(this._loadingManager);
          }

          const input = new InputController(scene);
          this._input = input;

          touchControls.setInputController(input);

          const gameLoopConfig = {
            engine,
            scene,
            inputController: input,
            roomManager: this._roomManager || undefined,
            localGameState: this._localGameState || undefined,
            ball,
            paddle,
            paddle2,
            camera: clientEngine.engineSetup.camera,
          };

          const gameLoop = new GameLoop(gameLoopConfig);
          this._gameLoop = gameLoop;

          if (isLocalMode) {
            gui.hud.showPauseButton(() => {
              gui.pauseOverlay.show();
              this._gameLoop?.pause();
              if (this._roomManager) {
                this._roomManager.sendPause();
              }
            });
          }

          if (this._room) {
            gameLoop.setInitialStates(
              this._room.state.ball.enabled ?? true,
              this._room.state.paddle.enabled ?? true,
              this._room.state.paddle2.enabled ?? true,
            );
            gameLoop.setupStateListeners();
          }

          gameLoop.start();

          if (isPvPMode && this._room && this._room.state) {
            const p1Name = this._room.state.player1Name || player1Name;
            const p2Name = this._room.state.player2Name || "Waiting...";
            let bottomLabel = p1Name;
            let topLabel = p2Name;

            if (this._room.sessionId === this._room.state.player2Id) {
              bottomLabel = p2Name || "Waiting...";
              topLabel = p1Name;
            }

            if (this._gui && this._gui.hud) {
              this._gui.hud.updatePlayerNames(bottomLabel, topLabel);
            }

            scene.executeWhenReady(() => {
              this._gameReadyManager?.start();
            });
          } else {
            scene.executeWhenReady(() => {
              this._gameReadyManager?.start();
            });
          }
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
        if ((this._room || this._localGameState) && clientEngine) {
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
    this._roomManager?.disconnect();
    this._roomManager = null;
    this._localGameState = null;
    this._room = null;
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

  private _createRoomManagerCallbacks(
    clientEngine: ClientEngine,
    table: any,
    paddle: any,
    paddle2: any,
    ball: any,
    gui: any,
  ): RoomManagerCallbacks {
    return {
      onPlayerAssignment: ({ isPlayer2, player1Id, player2Id }) => {
        this._isPlayer2 = isPlayer2;
        clientEngine.engineSetup.setIsPlayer2(isPlayer2);
        const cam = clientEngine.engineSetup.camera;
        const mesh = table.mesh;
        const center = mesh.getBoundingInfo().boundingBox.centerWorld;

        // Only apply flip once - on first assignment when isPlayer2 is true
        // Don't re-adjust after opponent joins (prevents flip from being overwritten)
        if (isPlayer2 && !this._isCameraFlipped) {
          // First set up camera for player 1, then flip
          adjustCamera(cam, mesh, clientEngine.engineSetup.engine);
          cam.position = new Vector3(
            cam.position.x,
            cam.position.y,
            -cam.position.z,
          );
          this._isCameraFlipped = true;
        } else if (!isPlayer2) {
          adjustCamera(cam, mesh, clientEngine.engineSetup.engine);
        }

        cam.setTarget(center);
      },
      onPlayerColorUpdate: ({ p1Color, p2Color, isPlayer2 }) => {
        gui.hud.updatePlayerColors(
          isPlayer2 ? p2Color : p1Color,
          isPlayer2 ? p1Color : p2Color,
        );
        [paddle, paddle2].forEach((p, i) => {
          const color = i === 0 ? p1Color : p2Color;
          const mat = p.mesh.material as any;
          if (mat?.albedoColor) mat.albedoColor = Color3.FromHexString(color);
          if (mat?.subSurface?.tintColor)
            mat.subSurface.tintColor = Color3.FromHexString(color);
        });
      },
      onBallUpdate: ({ vx, vy, vz }) => {
        this._gameLoop?.updateBallVelocity(vx, vy, vz);
      },
      onBallCollision: ({ lastImpactX, lastImpactZ, collisionTime }) => {
        // Approach A: Notify game loop for enhanced lerp speed
        // triggerBounce kept for API compatibility but doesn't affect position
        this._gameLoop?.notifyCollision();
        ball.triggerBounce(lastImpactX, lastImpactZ, collisionTime);
      },
      onPaddleUpdate: ({ paddleIndex, x, z, enabled }) => {
        this._gameLoop?.updatePaddlePosition(paddleIndex, x, z);
      },
      onScoreUpdate: ({ player1Score, player2Score }) => {
        const room = this._roomManager?.room;
        if (!room) return;
        let bottomScore = player1Score;
        let topScore = player2Score;
        if (room.sessionId === room.state.player1Id) {
          bottomScore = player1Score;
          topScore = player2Score;
        } else if (room.sessionId === room.state.player2Id) {
          bottomScore = player2Score;
          topScore = player1Score;
        }
        gui.hud.updateScores(
          bottomScore,
          topScore,
          room.state.winningScore?.toString() || this._winningScore,
        );
      },

      onGameOver: ({
        winner,
        player1Name,
        player2Name,
        player1Score,
        player2Score,
      }) => {
        if (!this._isGameOver) {
          this._isGameOver = true;
          this._gameLoop?.setGameOver(true);
          const room = this._roomManager?.room;
          const isP1Winner = winner === room?.state.player1Id;
          gui.gameOverOverlay.show(
            isP1Winner ? player1Name : player2Name,
            isP1Winner,
            player1Score,
            player2Score,
            player1Name,
            player2Name,
          );
        }
      },
      onPlayerNameUpdate: ({ player1Name, player2Name }) => {
        const room = this._roomManager?.room;
        if (!room) return;
        let bottomLabel = player1Name;
        let topLabel = player2Name;
        if (room.sessionId === room.state.player1Id) {
          bottomLabel = player1Name;
          topLabel = player2Name;
        } else if (room.sessionId === room.state.player2Id) {
          bottomLabel = player2Name;
          topLabel = player1Name;
        }
        gui.hud.updatePlayerNames(bottomLabel, topLabel);
      },
      onRoomExpired: () => {
        this._loadingManager?.handleRoomExpired();
        if (this._onBackToMenu) {
          alert("Room expired — no opponent joined within 2 minutes.");
          this._onBackToMenu();
        }
      },
      onGameStarted: () => {
        this._gameReadyManager?.updateGameStarted(true);
        this._loadingManager?.handleGameStarted();
      },
      onError: (error) => {
        console.error("Join error", error);
        alert("Failed to connect to game server. Please try again.");
        if (this._onBackToMenu) this._onBackToMenu();
      },
    };
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
