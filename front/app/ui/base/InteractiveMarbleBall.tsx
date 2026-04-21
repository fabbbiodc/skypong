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
  DIAMETER: 1.5,
  ROTATION_SPEED: Math.PI * 2 / 20,
} as const;

const ballSizeVariants = cva(
  "inline-block transition-transform duration-300 cursor-pointer hover:scale-105",
  {
    variants: {
      size: {
        sm: "w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] md:w-[200px] md:h-[200px] lg:w-[200px] lg:h-[200px]",
        md: "w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] md:w-[240px] md:h-[240px] lg:w-[260px] lg:h-[260px]",
        lg: "w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px]",
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
  const router = useRouter();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;

    let mounted = true;
    let animFrameId: number;

    const initializeScene = async () => {
      try {
        // Clear any existing children
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        container.appendChild(canvas);

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
          MARBLE_CONFIG.DIAMETER * 1.5,
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
          if (!mounted || !scene || !sphere) {
            return;
          }

          const currentTime = performance.now();
          const deltaTime = (currentTime - lastTime) / 1000;
          lastTime = currentTime;

          sphere.rotation.z += MARBLE_CONFIG.ROTATION_SPEED * deltaTime;
          sphere.rotation.x +=
            MARBLE_CONFIG.ROTATION_SPEED * 0.15 * deltaTime;

          scene.render();
        });
      } catch (error) {
        console.error("InteractiveMarbleBall: Failed to initialize", error);
      }
    };

    initializeScene();

    return () => {
      mounted = false;

      // Stop render loop first
      if (engineRef.current) {
        try {
          engineRef.current.stopRenderLoop();
        } catch {
          // Already stopped
        }
      }

      // Dispose scene
      if (sceneRef.current) {
        try {
          sceneRef.current.dispose();
        } catch {
          // Already disposed
        }
        sceneRef.current = null;
      }

      // Dispose engine
      if (engineRef.current) {
        try {
          engineRef.current.dispose();
        } catch {
          // Already disposed
        }
        engineRef.current = null;
      }

      // Clear container
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
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