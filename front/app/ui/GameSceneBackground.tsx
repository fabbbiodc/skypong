"use client";

import { useEffect, useRef, useState } from "react";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  Color4,
  EXRCubeTexture,
} from "@babylonjs/core";
import { GAME_SCENE_BG_CONFIG } from "./GameSceneBackgroundConfig";

/**
 * GameSceneBackground Component
 *
 * Renders a slowly rotating Babylon.js skybox using the game's EXR environment map.
 * This creates a visually cohesive experience between the frontend and game.
 *
 * The EXR file is copied to front/public/environment/ during setup.
 *
 * Features:
 * - Async EXR texture loading with timeout
 * - Smooth rotation animation (~60s per full revolution)
 * - Responsive to window resize
 * - Proper cleanup on unmount (prevents memory leaks)
 * - Fallback to clear color if texture fails
 */
export default function GameSceneBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;
    let animationFrameId: number;
    let resizeObserver: ResizeObserver | null = null;

    const initializeScene = async () => {
      try {
        // Create canvas element
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        containerRef.current!.appendChild(canvas);
        canvasRef.current = canvas;

        // Create engine with canvas
        const engine = new Engine(canvas, true, {
          preserveDrawingBuffer: false,
          disableWebGL2Support: false,
          useHighPrecisionFloats: true,
        });

        engineRef.current = engine;

        // Create scene
        const scene = new Scene(engine);
        scene.clearColor = new Color4(
          GAME_SCENE_BG_CONFIG.CLEAR_COLOR.r,
          GAME_SCENE_BG_CONFIG.CLEAR_COLOR.g,
          GAME_SCENE_BG_CONFIG.CLEAR_COLOR.b,
          1.0
        );
        scene.useRightHandedSystem = false;
        sceneRef.current = scene;

        // Create camera (not visible, just for scene management)
        const camera = new ArcRotateCamera(
          "bgCamera",
          Math.PI / 2,
          Math.PI / 2,
          GAME_SCENE_BG_CONFIG.CAMERA.DISTANCE,
          Vector3.Zero(),
          scene
        );
        camera.attachControl(canvas, true);
        camera.inertia = 0; // No inertia/smoothing, direct control
        camera.angularSensibilityX = 0; // Disable mouse input
        camera.angularSensibilityY = 0;

        // Load environment texture (EXR cubemap)
        let envTexture: EXRCubeTexture | null = null;
        let textureLoadComplete = false;

        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
        const texturePath = basePath
          ? `${basePath}/environment/dramatic-sky1.exr`
          : "/environment/dramatic-sky1.exr";

        const loadTextureWithTimeout = new Promise<void>((resolve) => {
          try {
            envTexture = new EXRCubeTexture(
              texturePath,
              scene,
              GAME_SCENE_BG_CONFIG.ENVIRONMENT.TEXTURE_SIZE,
              false, // doNotLoadCubeMapData
              true, // useInvertY
              false, // coerceToRenderTargetTexture
              true // useSRGBBuffer
            );

            // Setup load listeners
            if (envTexture.isReady()) {
              textureLoadComplete = true;
              resolve();
              return;
            }

            envTexture.onLoadObservable.addOnce(() => {
              textureLoadComplete = true;
              resolve();
            });

            // Timeout fallback
            const timeoutId = setTimeout(() => {
              if (!textureLoadComplete && mounted) {
                console.warn(
                  "GameSceneBackground: EXR texture load timeout, continuing with fallback"
                );
                resolve();
              }
            }, GAME_SCENE_BG_CONFIG.LOAD_TIMEOUT);

            return () => clearTimeout(timeoutId);
          } catch (error) {
            console.error("GameSceneBackground: Failed to create texture:", error);
            resolve();
          }
        });

        await loadTextureWithTimeout;

        // Apply environment if successfully loaded
        if (envTexture && mounted) {
          scene.environmentIntensity =
            GAME_SCENE_BG_CONFIG.ENVIRONMENT.INTENSITY;
          scene.environmentTexture = envTexture;
          scene.createDefaultSkybox(
            envTexture,
            true,
            GAME_SCENE_BG_CONFIG.ENVIRONMENT.SKYBOX_SCALE
          );
        }

        if (!mounted) return;

        setIsLoading(false);
        (window as any).__SKYBOX_READY__ = true;
        window.dispatchEvent(new CustomEvent("skybox-ready"));

        // Setup window resize handler
        const handleResize = () => {
          if (engine && !engine.isDisposed) {
            engine.resize();
          }
        };

        resizeObserver = new ResizeObserver(() => {
          handleResize();
        });
        resizeObserver.observe(containerRef.current!);

        // Animation loop with rotation
        let lastFrameTime = Date.now();
        const render = () => {
          if (!mounted || !engine || !scene) {
            return;
          }

          try {
            const now = Date.now();
            const deltaTime = (now - lastFrameTime) / 1000; // Convert to seconds
            lastFrameTime = now;

            // Rotate camera around center (creates rotating skybox effect)
            camera.alpha +=
              GAME_SCENE_BG_CONFIG.ROTATION.SPEED * (deltaTime * 60); // Normalize to 60 FPS

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
          setIsLoading(false);
        }
      }
    };

    initializeScene();

    // Cleanup function
    return () => {
      mounted = false;

      // Cancel animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Disconnect resize observer
      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      // Dispose Babylon.js resources
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }

      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }

      // Remove canvas from DOM
      if (canvasRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(canvasRef.current);
        } catch {
          // Ignore if already removed
        }
        canvasRef.current = null;
      }
    };
  }, []);

  return (
    <div className="game-scene-bg-wrapper">
      <div
        ref={containerRef}
        className="game-scene-bg-container"
        role="presentation"
        aria-hidden="true"
      />
      {/* Optional loading indicator */}
      {isLoading && !hasError && (
        <div className="game-scene-bg-loading" aria-busy="true" />
      )}
      {/* Optional error fallback message (hidden by default) */}
      {hasError && (
        <div className="game-scene-bg-error" style={{ display: "none" }}>
          Background loading failed, using fallback color
        </div>
      )}
    </div>
  );
}
