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
    onBackToMenu?: () => void,
    onResume?: () => void,
    onRetry?: () => void,
  ): Promise<GameEntities> {
    const scene = this.scene;
    const engine = this.engineSetup.engine;

    this.engineSetup.camera.setTarget(Vector3.Zero());

    const shadowGenerator = SceneLights.Create(scene);

    const ball = new ClientBall(scene);
    const table = new ClientTable(scene);

    const skybox = scene.getMeshByName("hdrSkyBox");
    const refractionRenderList = skybox
      ? [table.mesh, skybox, ball.mesh]
      : [table.mesh];

    const createPaddle = (name: string) =>
      new ClientPaddle(scene, {
        name,
        materialKey: "CLEARGLASS",
        albedoColor: new Color3(0.5, 0.5, 0.5),
        tintColor: new Color3(0.5, 0.5, 0.5),
        refractionRenderList,
      });

    const paddle = createPaddle("paddle1");
    const paddle2 = createPaddle("paddle2");

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

    const isPvPMode = false;
    const isAIMode = false;
    gui.showGameHUD(
      player1Name,
      isPvPMode ? "Waiting..." : isAIMode ? "AI" : player2Name,
    );

    this._entities = { ball, table, paddle, paddle2, gui, touchControls };

    await SceneLights.waitForLoad();

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
