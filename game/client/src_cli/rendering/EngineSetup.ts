import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  Color4,
  Mesh,
} from "@babylonjs/core";
import { RENDERING, CAMERA } from "../config";
import { adjustCamera } from "../utils/Camera";

export type CameraViewType = "angled" | "top-down";

export class EngineSetup {
  public engine: Engine;
  public scene: Scene;
  public camera: FreeCamera;

  private _resizeTarget: Mesh | null = null;
  private _resizeHandler: (() => void) | null = null;
  private _isPlayer2: boolean = false;
  private _cameraView: CameraViewType = "angled";
  private _contextLostHandler: ((e: Event) => void) | null = null;
  private _contextRestoredHandler: (() => void) | null = null;
  private _onContextLost: (() => void) | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    isFPV: boolean = false,
    cameraView: CameraViewType = "angled",
    onContextLost?: () => void,
  ) {
    this._cameraView = cameraView;
    this._onContextLost = onContextLost || null;
    this.engine = this.createEngine(canvas);
    this.scene = this.createScene();
    this.camera = this.createCamera(isFPV);
    this.setupContextLossHandling(canvas);
  }

  public setResizeTarget(mesh: Mesh): void {
    this._resizeTarget = mesh;
    this.handleResize();
  }

  public setIsPlayer2(isPlayer2: boolean): void {
    this._isPlayer2 = isPlayer2;
  }

  private setupContextLossHandling(canvas: HTMLCanvasElement): void {
    this._contextLostHandler = (e: Event) => {
      e.preventDefault();
      console.warn("[EngineSetup] WebGL context lost");
      this._onContextLost?.();
    };

    this._contextRestoredHandler = () => {
      console.log("[EngineSetup] WebGL context restored, reloading page");
      window.location.reload();
    };

    canvas.addEventListener("webglcontextlost", this._contextLostHandler);
    canvas.addEventListener("webglcontextrestored", this._contextRestoredHandler);
  }

  private createEngine(canvas: HTMLCanvasElement): Engine {
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: false,
      disableWebGL2Support: false,
      useHighPrecisionFloats: true,
    });

    this._resizeHandler = () => {
      this.handleResize();
    };
    window.addEventListener("resize", this._resizeHandler);

    return engine;
  }

  public dispose(): void {
    if (this._resizeHandler) {
      window.removeEventListener("resize", this._resizeHandler);
      this._resizeHandler = null;
    }

    const canvas = this.engine.getRenderingCanvas();
    if (canvas && this._contextLostHandler) {
      canvas.removeEventListener("webglcontextlost", this._contextLostHandler);
    }
    if (canvas && this._contextRestoredHandler) {
      canvas.removeEventListener("webglcontextrestored", this._contextRestoredHandler);
    }

    this.camera.detachControl();
    this._resizeTarget = null;
  }

  private handleResize(): void {
    this.engine.resize();
    if (this._resizeTarget) {
      if (!this._resizeTarget.isDisposed()) {
        const center =
          this._resizeTarget.getBoundingInfo().boundingBox.centerWorld;
        adjustCamera(this.camera, this._resizeTarget, this.engine);

        if (this._isPlayer2) {
          this.camera.position = new Vector3(
            this.camera.position.x,
            this.camera.position.y,
            -this.camera.position.z,
          );
          this.camera.setTarget(center);
        }
      }
    }
  }

  private createScene(): Scene {
    const scene = new Scene(this.engine);
    scene.clearColor = Color4.FromHexString(RENDERING.CLEAR_COLOR);
    return scene;
  }

  private createCamera(isFPV: boolean = false): FreeCamera {
    const cameraPos =
      this._cameraView === "top-down"
        ? CAMERA.TOP_DOWN_POSITION
        : CAMERA.DEFAULT_POSITION;

    const camera = new FreeCamera(
      "camera",
      new Vector3(cameraPos.x, cameraPos.y, cameraPos.z),
      this.scene,
    );

    if (isFPV) {
      camera.setTarget(new Vector3(0, 0, 10));
    } else {
      camera.setTarget(Vector3.Zero());
      if (this._cameraView === "top-down") {
        camera.upVector = new Vector3(-10, 0, 0);
      }
    }

    camera.attachControl();
    camera.inputs.removeByType("FreeCameraKeyboardMoveInput");

    return camera;
  }
}
