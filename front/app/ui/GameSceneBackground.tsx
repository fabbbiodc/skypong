"use client";

import "@babylonjs/loaders";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  Color4,
  EXRCubeTexture,
} from "@babylonjs/core";
import { GAME_SCENE_BG_CONFIG } from "./GameSceneBackgroundConfig";

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod|Android/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

function getEXRPath(): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const filename = isMobileDevice()
    ? "dramatic-sky1-mobile.exr"
    : "dramatic-sky1.exr";
  return basePath ? `${basePath}/environment/${filename}` : `/environment/${filename}`;
}

async function loadEXRWithRetry(
  scene: Scene,
  maxRetries = 3,
  timeoutMs = 8000,
): Promise<EXRCubeTexture | null> {
  const texturePath = getEXRPath();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[GameSceneBackground] Loading EXR (attempt ${attempt}/${maxRetries}): ${texturePath}`,
      );

      const envTexture = new EXRCubeTexture(
        texturePath,
        scene,
        GAME_SCENE_BG_CONFIG.ENVIRONMENT.TEXTURE_SIZE,
        false,
        true,
        false,
        true,
      );

      const loadPromise = new Promise<EXRCubeTexture>((resolve, reject) => {
        if (envTexture.isReady()) {
          resolve(envTexture);
          return;
        }

        const timeoutId = setTimeout(() => {
          if (envTexture.isReady()) {
            resolve(envTexture);
          } else {
            reject(new Error("EXR load timeout"));
          }
        }, timeoutMs);

        envTexture.onLoadObservable.addOnce(() => {
          clearTimeout(timeoutId);
          resolve(envTexture);
        });
      });

      const result = await loadPromise;
      console.log(`[GameSceneBackground] EXR loaded successfully on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.warn(
        `[GameSceneBackground] EXR load attempt ${attempt} failed:`,
        error,
      );

      if (attempt === maxRetries) {
        console.error("[GameSceneBackground] All EXR load attempts failed");
        return null;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  return null;
}

export default function GameSceneBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const signalReady = useCallback(() => {
    setIsLoading(false);
    (window as any).__SKYBOX_READY__ = true;
    window.dispatchEvent(new CustomEvent("skybox-ready"));
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;
    let animationFrameId: number;
    let resizeObserver: ResizeObserver | null = null;

    const initializeScene = async () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        canvas.style.touchAction = "none";
        containerRef.current!.appendChild(canvas);
        canvasRef.current = canvas;

        const engine = new Engine(canvas, true, {
          preserveDrawingBuffer: false,
          disableWebGL2Support: false,
          useHighPrecisionFloats: true,
        });

        engineRef.current = engine;

        const scene = new Scene(engine);
        scene.clearColor = new Color4(
          GAME_SCENE_BG_CONFIG.CLEAR_COLOR.r,
          GAME_SCENE_BG_CONFIG.CLEAR_COLOR.g,
          GAME_SCENE_BG_CONFIG.CLEAR_COLOR.b,
          1.0,
        );
        scene.useRightHandedSystem = false;
        sceneRef.current = scene;

        const camera = new ArcRotateCamera(
          "bgCamera",
          Math.PI / 2,
          Math.PI / 2,
          GAME_SCENE_BG_CONFIG.CAMERA.DISTANCE,
          Vector3.Zero(),
          scene,
        );
        camera.attachControl(canvas, true);
        camera.inertia = 0;
        camera.angularSensibilityX = 0;
        camera.angularSensibilityY = 0;

        const envTexture = await loadEXRWithRetry(scene);

        if (envTexture && mounted) {
          scene.environmentIntensity =
            GAME_SCENE_BG_CONFIG.ENVIRONMENT.INTENSITY;
          scene.environmentTexture = envTexture;
          scene.createDefaultSkybox(
            envTexture,
            true,
            GAME_SCENE_BG_CONFIG.ENVIRONMENT.SKYBOX_SCALE,
          );
        } else if (mounted) {
          setHasError(true);
        }

        if (!mounted) return;

        signalReady();

        const handleResize = () => {
          if (engine && !engine.isDisposed) {
            engine.resize();
          }
        };

        resizeObserver = new ResizeObserver(() => {
          handleResize();
        });
        resizeObserver.observe(containerRef.current!);

        let lastFrameTime = Date.now();
        const render = () => {
          if (!mounted || !engine || !scene) {
            return;
          }

          try {
            const now = Date.now();
            const deltaTime = (now - lastFrameTime) / 1000;
            lastFrameTime = now;

            camera.alpha +=
              GAME_SCENE_BG_CONFIG.ROTATION.SPEED * (deltaTime * 60);

            scene.render();
          } catch (error) {
            console.error("GameSceneBackground: Render error:", error);
          }

          animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);
      } catch (error) {
        console.error("GameSceneBackground: Initialization error:", error);
        if (mounted) {
          setHasError(true);
          signalReady();
        }
      }
    };

    initializeScene();

    return () => {
      mounted = false;

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }

      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }

      if (canvasRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(canvasRef.current);
        } catch {
          // Ignore if already removed
        }
        canvasRef.current = null;
      }
    };
  }, [signalReady]);

  return (
    <div className="game-scene-bg-wrapper">
      <div
        ref={containerRef}
        className="game-scene-bg-container"
        role="presentation"
        aria-hidden="true"
      />
      {isLoading && !hasError && (
        <div className="game-scene-bg-loading" aria-busy="true" />
      )}
      {hasError && (
        <div className="game-scene-bg-error" style={{ display: "none" }}>
          Background loading failed, using fallback color
        </div>
      )}
    </div>
  );
}
