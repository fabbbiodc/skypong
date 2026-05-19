import {
  Scene,
  Vector3,
  HemisphericLight,
  DirectionalLight,
  ShadowGenerator,
  Color3,
  PointLight,
  CubeTexture,
} from "@babylonjs/core";
import { RENDERING } from "../config";
import { CloudObject } from "./CloudObject";
import { shouldUseMobileEXR } from "../utils/deviceDetection";

export class SceneLights {
  private static _envTexture: CubeTexture | null = null;
  private static _loadingPromise: Promise<void> | null = null;
  private static _scene: Scene | null = null;
  private static _skyboxCreated = false;

  public static async waitForLoad(): Promise<void> {
    if (SceneLights._loadingPromise) {
      await SceneLights._loadingPromise;
    }
    await CloudObject.waitForLoad();
  }

  private static getTexturePath(): string {
    if (shouldUseMobileEXR()) {
      return RENDERING.ENVIRONMENT.TEXTURE_PATH.replace(".exr", "-mobile.env");
    }
    return RENDERING.ENVIRONMENT.TEXTURE_PATH.replace(".exr", ".env");
  }

  private static async loadEnvWithRetry(
    scene: Scene,
    onProgress?: (progress: number) => void,
  ): Promise<CubeTexture | null> {
    const maxRetries = 3;
    const timeoutMs = 5000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const texturePath = this.getTexturePath();
        console.log(
          `[SceneLights] Loading .env (attempt ${attempt}/${maxRetries}): ${texturePath}`,
        );

        const envTexture = CubeTexture.CreateFromPrefilteredData(
          texturePath,
          scene,
        );

        const loadPromise = new Promise<CubeTexture>((resolve, reject) => {
          if (envTexture.isReady()) {
            resolve(envTexture);
            return;
          }

          const timeoutId = setTimeout(() => {
            if (envTexture.isReady()) {
              resolve(envTexture);
            } else {
              reject(new Error(".env load timeout"));
            }
          }, timeoutMs);

          envTexture.onLoadObservable?.addOnce?.(() => {
            clearTimeout(timeoutId);
            resolve(envTexture);
          });
        });

        const result = await loadPromise;
        onProgress?.(40);
        console.log(`[SceneLights] .env loaded successfully on attempt ${attempt}`);
        return result;
      } catch (error) {
        console.warn(
          `[SceneLights] .env load attempt ${attempt} failed:`,
          error,
        );

        if (attempt === maxRetries) {
          console.error("[SceneLights] All .env load attempts failed");
          return null;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    return null;
  }

  public static Create(scene: Scene, onProgress?: (progress: number) => void): ShadowGenerator {
    SceneLights._scene = scene;

    if (SceneLights._envTexture) {
      SceneLights._envTexture.dispose();
    }

    SceneLights._loadingPromise = (async () => {
      const envTexture = await this.loadEnvWithRetry(scene, onProgress);

      if (envTexture) {
        SceneLights._envTexture = envTexture;
        scene.environmentTexture = envTexture;
        scene.createDefaultSkybox(
          envTexture,
          true,
          RENDERING.ENVIRONMENT.SKYBOX_SCALE,
        );
        SceneLights._skyboxCreated = true;
      } else {
        console.error("[SceneLights] Failed to load .env texture after retries. Skybox will not be created.");
      }
    })();

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

  public static hasSkybox(): boolean {
    return SceneLights._skyboxCreated;
  }
}
