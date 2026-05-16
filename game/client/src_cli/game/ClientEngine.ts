import { Scene, Vector3, Color3 } from "@babylonjs/core";
import { ClientBall } from "../entities/ClientBall";
import { ClientTable } from "../entities/ClientTable";
import { ClientPaddle } from "../entities/ClientPaddle";
import { SceneLights } from "../rendering/SceneLights";
import { EngineSetup, CameraViewType } from "../rendering/EngineSetup";
import { GameUIManager } from "../ui/GameUIManager";
import { TouchControls } from "../ui/TouchControls";
import { touchDetection } from "../utils/touchDetection";
import { RENDERING } from "../config";
import { GameSessionConfig } from "../types/GameSessionConfig";

export interface GameEntities {
  ball: ClientBall;
  table: ClientTable;
  paddle: ClientPaddle;
  paddle2: ClientPaddle;
  gui: GameUIManager;
  touchControls: TouchControls;
}

export class ClientEngine {
  public engineSetup: EngineSetup;
  public scene: Scene;
  private _entities: GameEntities | null = null;
  private _touchControls: TouchControls | null = null;
  private _config: GameSessionConfig;

  constructor(canvas: HTMLCanvasElement, config: GameSessionConfig) {
    this._config = config;
    const { gameMode, cameraView } = config;
    const isLocal2P = gameMode === "local-2p";

    this.engineSetup = new EngineSetup(
      canvas,
      false,
      cameraView || (isLocal2P ? "top-down" : "angled"),
    );
    this.scene = this.engineSetup.scene;
  }

  public async init(
    player1Name: string,
    player2Name: string,
    onProgress?: (progress: number) => void,
    onBackToMenu?: () => void,
    onResume?: () => void,
    onRetry?: () => void,
  ): Promise<GameEntities> {
    const scene = this.scene;
    const engine = this.engineSetup.engine;

    this.engineSetup.camera.setTarget(Vector3.Zero());

    onProgress?.(10);

    const shadowGenerator = SceneLights.Create(scene, onProgress);

    const ball = new ClientBall(scene);
    const table = new ClientTable(scene);

    const skybox = scene.getMeshByName("hdrSkyBox");
    const refractionRenderList = skybox
      ? [table.mesh, skybox, ball.mesh]
      : [table.mesh];

    const createPaddle = (name: string, color?: Color3) =>
      new ClientPaddle(scene, {
        name,
        materialKey: "CLEARGLASS",
        albedoColor: color || new Color3(0.5, 0.5, 0.5),
        tintColor: color || new Color3(0.5, 0.5, 0.5),
        refractionRenderList,
      });

    const p1Color = Color3.FromHexString(this._config.playerColor);
    // AI opponent always uses grey color
    const isAgainstAI = this._config.gameMode.startsWith("ai-");
    const aiColor = new Color3(0.5, 0.5, 0.5);
    const p2Color = isAgainstAI 
      ? aiColor 
      : (this._config.player2Color 
        ? Color3.FromHexString(this._config.player2Color) 
        : new Color3(0.96, 0.32, 0.11));

    const paddle = createPaddle("paddle1", p1Color);
    const paddle2 = createPaddle("paddle2", p2Color);

    const gui = new GameUIManager(
      scene,
      this._config,
      onBackToMenu || (() => {}),
      onResume,
      onRetry,
    );

    const hasTouch = touchDetection();
    const touchControls = new TouchControls(gui.texture);

    if (hasTouch) {
      touchControls.showControls();
    }

    [table.mesh, ball.mesh, paddle.mesh, paddle2.mesh].forEach((m) => {
      m.renderingGroupId = RENDERING.RENDERING_GROUPS.GAME_OBJECTS;
    });

    shadowGenerator.addShadowCaster(ball.mesh);

    this.engineSetup.setResizeTarget(table.mesh);

    onProgress?.(70);

    const isPvP = false;
    const player2Label = isPvP ? "Waiting..." : this._config.gameMode.startsWith("ai-") ? "AI" : player2Name;
    gui.showGameHUD(
      player1Name,
      player2Label,
    );

    this._entities = { ball, table, paddle, paddle2, gui, touchControls };

    await SceneLights.waitForLoad();

    onProgress?.(85);

    return this._entities;
  }

  public getEntities(): GameEntities | null {
    return this._entities;
  }

  public dispose(): void {
    this._entities?.gui.dispose();
    this._entities = null;
    this.engineSetup.dispose();
  }
}
