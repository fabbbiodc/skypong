"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Engine,
  Scene,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Color3,
  Color4,
  Vector3,
  ArcRotateCamera,
  Texture,
  DirectionalLight,
  HemisphericLight,
  PointLight,
} from "@babylonjs/core";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const MARBLE_CONFIG = {
  DIAMETER: 1.0,
  ROTATION_SPEED: Math.PI * 2 / 20,
} as const;

const ballSizeVariants = cva(
  "inline-block transition-transform duration-300 cursor-pointer hover:scale-105",
  {
    variants: {
      size: {
        sm: "w-[210px] h-[210px]",
        md: "w-[294px] h-[294px]",
        lg: "w-[420px] h-[420px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

type BallSize = VariantProps<typeof ballSizeVariants>["size"];

export interface InteractiveMarbleBallProps {
  size?: BallSize;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function InteractiveMarbleBall({
  size = "md",
  className,
  onClick,
  disabled = false,
}: InteractiveMarbleBallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sphereRef = useRef<Mesh | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    let mounted = true;

    const initializeScene = async () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        containerRef.current!.appendChild(canvas);
        canvasRef.current = canvas;

        const engine = new Engine(canvas, true, {
          preserveDrawingBuffer: true,
          disableWebGL2Support: false,
        });
        engineRef.current = engine;

        const scene = new Scene(engine);
        scene.clearColor = new Color4(0, 0, 0, 0);
        sceneRef.current = scene;

        const camera = new ArcRotateCamera(
          "ballCamera",
          Math.PI / 4,
          Math.PI / 2.5,
          MARBLE_CONFIG.DIAMETER * 2.5,
          Vector3.Zero(),
          scene
        );
        camera.attachControl(canvas, false);
        camera.inputs.clear();

        const sphere = MeshBuilder.CreateSphere(
          "marbleBall",
          { diameter: MARBLE_CONFIG.DIAMETER, segments: 64 },
          scene
        );
        sphereRef.current = sphere;

        const marbleMat = new PBRMaterial("marbleMaterial", scene);
        marbleMat.albedoColor = new Color3(0.92, 0.92, 0.95);
        marbleMat.metallic = 0.0;
        marbleMat.roughness = 0.15;
        marbleMat.forceIrradianceInFragment = true;

        const textureBase = "/textures/marble/";
        const albedoTex = new Texture(
          `${textureBase}marble_albedo.jpg`,
          scene,
          false,
          true,
          Texture.TRILINEAR_SAMPLINGMODE
        );
        if (!albedoTex.isReady()) {
          await new Promise<void>((resolve) => {
            albedoTex.onLoadObservable.addOnce(() => resolve());
          });
        }
        marbleMat.albedoTexture = albedoTex;

        const normalTex = new Texture(
          `${textureBase}marble_nor.jpg`,
          scene,
          false,
          true,
          Texture.TRILINEAR_SAMPLINGMODE
        );
        if (!normalTex.isReady()) {
          await new Promise<void>((resolve) => {
            normalTex.onLoadObservable.addOnce(() => resolve());
          });
        }
        marbleMat.bumpTexture = normalTex;
        marbleMat.bumpTexture.level = 0.6;
        marbleMat.invertNormalMapX = true;
        marbleMat.invertNormalMapY = true;

        const roughnessTex = new Texture(
          `${textureBase}marble_rough.jpg`,
          scene,
          false,
          true,
          Texture.TRILINEAR_SAMPLINGMODE
        );
        if (!roughnessTex.isReady()) {
          await new Promise<void>((resolve) => {
            roughnessTex.onLoadObservable.addOnce(() => resolve());
          });
        }
        marbleMat.metallicTexture = roughnessTex;
        marbleMat.useRoughnessFromMetallicTextureGreen = true;
        marbleMat.useMetallnessFromMetallicTextureBlue = true;
        marbleMat.metallic = 0.0;

        sphere.material = marbleMat;

        const dirLight = new DirectionalLight(
          "dirLight",
          new Vector3(-1, -2, -1),
          scene
        );
        dirLight.intensity = 1.5;
        dirLight.diffuse = new Color3(1, 0.98, 0.95);

        const hemiLight = new HemisphericLight(
          "hemiLight",
          new Vector3(0, 1, 0),
          scene
        );
        hemiLight.intensity = 0.7;
        hemiLight.diffuse = new Color3(0.95, 0.95, 1.0);
        hemiLight.groundColor = new Color3(0.2, 0.2, 0.25);

        const pointLight = new PointLight(
          "pointLight",
          new Vector3(2, 2, -2),
          scene
        );
        pointLight.intensity = 0.6;
        pointLight.diffuse = new Color3(1, 0.95, 0.9);

        let lastTime = performance.now();

        engine.runRenderLoop(function () {
          if (!mounted || !scene || !sphereRef.current) {
            engine.stopRenderLoop();
            return;
          }

          const currentTime = performance.now();
          const deltaTime = (currentTime - lastTime) / 1000;
          lastTime = currentTime;

          sphereRef.current.rotation.z += MARBLE_CONFIG.ROTATION_SPEED * deltaTime;
          sphereRef.current.rotation.x +=
            MARBLE_CONFIG.ROTATION_SPEED * 0.15 * deltaTime;

          scene.render();
        });
      } catch {
        console.error("InteractiveMarbleBall: Failed to initialize");
      }
    };

    initializeScene();

    return () => {
      mounted = false;
      if (engineRef.current) {
        engineRef.current.stopRenderLoop();
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
          // Already removed
        }
        canvasRef.current = null;
      }
    };
  }, [size]);

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else {
      router.push("/play");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Click to play"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(ballSizeVariants({ size }), className)}
    />
  );
}