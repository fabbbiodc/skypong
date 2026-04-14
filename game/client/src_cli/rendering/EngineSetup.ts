import { Engine, Scene, FreeCamera, Vector3, Color4, Mesh } from "@babylonjs/core";
import { RENDERING, CAMERA } from '../config';
import { adjustCamera } from "../utils/Camera";

export type CameraViewType = 'angled' | 'top-down';

export class EngineSetup {
    public engine: Engine;
    public scene: Scene;
    public camera: FreeCamera;

    private _resizeTarget: Mesh | null = null;
    private _resizeHandler: (() => void) | null = null;
    private _isPlayer2: boolean = false; // Track if this is Player 2 (for camera flip)
    private _cameraView: CameraViewType = 'angled';

    constructor(canvas: HTMLCanvasElement, isFPV: boolean = false, cameraView: CameraViewType = 'angled') {
        this._cameraView = cameraView;
        this.engine = this.createEngine(canvas);
        this.scene = this.createScene();
        this.camera = this.createCamera(isFPV);
    }

    public setResizeTarget(mesh: Mesh): void {
        this._resizeTarget = mesh;
        this.handleResize();
    }

    /**
     * Set whether this client is Player 2 (for camera flip on resize)
     */
    public setIsPlayer2(isPlayer2: boolean): void {
        this._isPlayer2 = isPlayer2;
    }

    private createEngine(canvas: HTMLCanvasElement): Engine {
        const engine = new Engine(canvas, true);

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
        this.camera.detachControl();
        this._resizeTarget = null;
    }

    private handleResize(): void {
        this.engine.resize();
        if (this._resizeTarget) {
            if (!this._resizeTarget.isDisposed()) {
                const center = this._resizeTarget.getBoundingInfo().boundingBox.centerWorld;
                adjustCamera(this.camera, this._resizeTarget, this.engine);

                // If Player 2, flip camera after adjust
                if (this._isPlayer2) {
                    this.camera.position = new Vector3(this.camera.position.x, this.camera.position.y, -this.camera.position.z);
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
        const cameraPos = this._cameraView === 'top-down' ? CAMERA.TOP_DOWN_POSITION : CAMERA.DEFAULT_POSITION;

        const camera = new FreeCamera(
            "camera",
            new Vector3(
                cameraPos.x,
                cameraPos.y,
                cameraPos.z
            ),
            this.scene
        );

        if (isFPV) {
            camera.setTarget(new Vector3(0, 0, 10));
        } else {
            camera.setTarget(Vector3.Zero());
            if (this._cameraView === 'top-down') {
                    camera.upVector = new Vector3(-10, 0, 0);
            }
        }

        camera.attachControl();
        
        // Disable arrow keys for camera movement (keep only mouse drag)
        camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
        
        return camera;
    }
}
