import {
  Scene,
  Vector3,
  HemisphericLight,
  DirectionalLight,
  ShadowGenerator,
  Color3,
  PointLight,
  EXRCubeTexture,
} from "@babylonjs/core";
import { RENDERING } from "../config";
import { CloudObject } from "./CloudObject";

export class SceneLights {
  private static _envTexture: EXRCubeTexture | null = null;
  private static _loadingPromise: Promise<void> | null = null;
  private static _scene: Scene | null = null;

  public static async waitForLoad(): Promise<void> {
    if (SceneLights._loadingPromise) {
      await SceneLights._loadingPromise;
    }
    await CloudObject.waitForLoad();
  }

  public static Create(scene: Scene, onProgress?: (progress: number) => void): ShadowGenerator {
    SceneLights._scene = scene;

    if (SceneLights._envTexture) {
      SceneLights._envTexture.dispose();
    }

    const envTexture = new EXRCubeTexture(
      RENDERING.ENVIRONMENT.TEXTURE_PATH,
      scene,
      RENDERING.ENVIRONMENT.TEXTURE_SIZE,
      false,
      true,
      false,
      true,
    );

    SceneLights._envTexture = envTexture;

    SceneLights._loadingPromise = new Promise<void>((resolve) => {
      if (envTexture.isReady()) {
        onProgress?.(40);
        resolve();
        return;
      }

      envTexture.onLoadObservable.addOnce(() => {
        onProgress?.(40);
        resolve();
      });

      setTimeout(() => {
        resolve();
      }, 3000);
    });

    scene.environmentIntensity = RENDERING.ENVIRONMENT.INTENSITY;
    scene.environmentTexture = envTexture;
    scene.createDefaultSkybox(
      envTexture,
      true,
      RENDERING.ENVIRONMENT.SKYBOX_SCALE,
    );

    const hemiLight = new HemisphericLight(
      "hemiLight",
      new Vector3(0, 1, 0),
      scene,
    );

    hemiLight.intensity = RENDERING.LIGHTS.HEMISPHERIC.INTENSITY;
    hemiLight.diffuse = RENDERING.LIGHTS.HEMISPHERIC.DIFFUSE;
    hemiLight.groundColor = RENDERING.LIGHTS.HEMISPHERIC.GROUND_COLOR;

    const dirLight = new DirectionalLight(
      "dirLight",
      RENDERING.LIGHTS.DIRECTIONAL.DIRECTION,
      scene,
    );

    const cloudPos = new Vector3(1, -5, 0);
    const cloudObject = new CloudObject(scene, cloudPos, onProgress);

    dirLight.position = RENDERING.LIGHTS.DIRECTIONAL.POSITION;
    dirLight.intensity = RENDERING.LIGHTS.DIRECTIONAL.INTENSITY;

    const shadowGenerator = new ShadowGenerator(
      RENDERING.SHADOWS.MAP_SIZE,
      dirLight,
    );
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = RENDERING.SHADOWS.BLUR_KERNEL;

    const pointLight = new PointLight(
      "shineDebugLight",
      RENDERING.LIGHTS.POINT.POSITION,
      scene,
    );
    pointLight.intensity = RENDERING.LIGHTS.POINT.INTENSITY;
    pointLight.diffuse = RENDERING.LIGHTS.POINT.DIFFUSE;
    pointLight.specular = RENDERING.LIGHTS.POINT.SPECULAR;

    return shadowGenerator;
  }
}
