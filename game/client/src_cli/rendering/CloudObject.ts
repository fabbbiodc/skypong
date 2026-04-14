import { Scene, Vector3, SpriteManager, Sprite, Color4 } from "@babylonjs/core";

export class CloudObject {
  private static spriteManager: SpriteManager | null = null;
  private static loadingPromise: Promise<void> | null = null;
  private static _scene: Scene | null = null;

  public sprite: Sprite;

  constructor(scene: Scene, position: Vector3) {
    CloudObject._scene = scene;

    if (CloudObject.spriteManager) {
      CloudObject.spriteManager.dispose();
      CloudObject.spriteManager = null;
    }

    CloudObject.spriteManager = new SpriteManager(
      "cloudsManager",
      "textures/cloud.png",
      100,
      256,
      scene,
    );

    CloudObject.loadingPromise = new Promise<void>((resolve) => {
      const texture = CloudObject.spriteManager!.texture;

      if (texture.isReady()) {
        resolve();
        return;
      }

      texture.onLoadObservable.addOnce(() => {
        resolve();
      });

      setTimeout(() => {
        resolve();
      }, 3000);
    });

    this.sprite = new Sprite("cloudSprite", CloudObject.spriteManager);

    this.sprite.position = position;

    this.sprite.color = new Color4(1, 1, 1, 1);

    this.sprite.size = 20;
  }

  public static async waitForLoad(): Promise<void> {
    if (CloudObject.loadingPromise) {
      await CloudObject.loadingPromise;

      if (CloudObject._scene) {
        CloudObject._scene.render();
      }
    }
  }
}
