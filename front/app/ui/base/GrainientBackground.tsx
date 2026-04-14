"use client";

import { useEffect, useRef } from "react";

// ============================================================================
// COMPONENT INTERFACE
// ============================================================================

interface GrainientBackgroundProps {
  // Color props (will use CSS vars by default)
  color1?: string;
  color2?: string;
  color3?: string;

  // Animation props
  timeSpeed?: number;
  colorBalance?: number;

  // Warp effect props
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;

  // Blend props
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;

  // Noise/grain props
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;

  // Post-processing props
  contrast?: number;
  gamma?: number;
  saturation?: number;

  // Transform props
  centerX?: number;
  centerY?: number;
  zoom?: number;

  // Standard React props
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function interpolateColors(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
  factor: number,
) {
  factor = Math.max(0, Math.min(1, factor));
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * factor),
    g: Math.round(color1.g + (color2.g - color1.g) * factor),
    b: Math.round(color1.b + (color2.b - color1.b) * factor),
  };
}

function rgbToString(color: { r: number; g: number; b: number }): string {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

function clamp(value: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, value));
}

function applyContrast(value: number, contrast: number): number {
  return clamp(((value / 255 - 0.5) * contrast + 0.5) * 255);
}

function applyGamma(value: number, gamma: number): number {
  return clamp(Math.pow(value / 255, 1 / gamma) * 255);
}

function simpleNoise(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

function applyPostProcessing(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    contrast: number;
    gamma: number;
    saturation: number;
    noiseScale: number;
    grainAmount: number;
    grainScale: number;
    grainAnimated: boolean;
    time: number;
  },
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  // Apply grain/noise effect
  const grainStep = Math.max(1, Math.floor(options.grainScale));
  const noiseSeed = options.grainAnimated ? options.time * 100 : 0;

  for (let y = 0; y < height; y += grainStep) {
    for (let x = 0; x < width; x += grainStep) {
      const i = (y * width + x) * 4;

      // Skip if out of bounds
      if (i >= pixels.length) continue;

      // Generate noise value
      const noiseValue =
        (simpleNoise(
          x * options.noiseScale * 0.01,
          y * options.noiseScale * 0.01,
          noiseSeed,
        ) -
          0.5) *
        255 *
        options.grainAmount;

      // Apply contrast
      pixels[i] = applyContrast(pixels[i], options.contrast);
      pixels[i + 1] = applyContrast(pixels[i + 1], options.contrast);
      pixels[i + 2] = applyContrast(pixels[i + 2], options.contrast);

      // Apply gamma
      pixels[i] = applyGamma(pixels[i], options.gamma);
      pixels[i + 1] = applyGamma(pixels[i + 1], options.gamma);
      pixels[i + 2] = applyGamma(pixels[i + 2], options.gamma);

      // Apply saturation
      const gray =
        pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
      pixels[i] = clamp(gray + (pixels[i] - gray) * options.saturation);
      pixels[i + 1] = clamp(gray + (pixels[i + 1] - gray) * options.saturation);
      pixels[i + 2] = clamp(gray + (pixels[i + 2] - gray) * options.saturation);

      // Apply grain/noise
      pixels[i] = clamp(pixels[i] + noiseValue);
      pixels[i + 1] = clamp(pixels[i + 1] + noiseValue);
      pixels[i + 2] = clamp(pixels[i + 2] + noiseValue);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GrainientBackground({
  color1,
  color2,
  color3,
  timeSpeed = 0.25,
  colorBalance = 0,
  warpStrength = 0.55,
  warpFrequency = 1.3,
  warpSpeed = 2,
  warpAmplitude = 50,
  blendAngle = 0,
  blendSoftness = 0.01,
  rotationAmount = 500,
  noiseScale = 1.5,
  grainAmount = 0.05,
  grainScale = 2,
  grainAnimated = false,
  contrast = 1.5,
  gamma = 1,
  saturation = 1,
  centerX = 0,
  centerY = 0,
  zoom = 0.9,
  className,
  style,
}: GrainientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size to match viewport
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Defer initial canvas sizing to avoid forcing layout during page load
    requestAnimationFrame(() => {
      setCanvasSize();
    });

    window.addEventListener("resize", setCanvasSize);

    // Get colors from CSS variables or use props
    const getColors = () => {
      if (color1 && color2 && color3) {
        return [hexToRgb(color1), hexToRgb(color2), hexToRgb(color3)];
      }

      const styles = getComputedStyle(document.documentElement);
      return [
        hexToRgb(
          styles.getPropertyValue("--color-bg-gradient-1").trim() || "#9333ea",
        ),
        hexToRgb(
          styles.getPropertyValue("--color-bg-gradient-2").trim() || "#ffffff",
        ),
        hexToRgb(
          styles.getPropertyValue("--color-bg-gradient-3").trim() || "#B19EEF",
        ),
      ];
    };

    const colors = getColors();

    // Animation state
    let time = 0;
    let animationId: number;
    let frameCount = 0;
    const GRAIN_UPDATE_INTERVAL = 2; // Update grain every 2-3 frames

    // Main animation loop
    const animate = () => {
      time += timeSpeed * 0.016; // Normalize to ~60fps
      frameCount++;

      // 1. Create base gradient with rotation and warp
      const angle =
        time * rotationAmount * 0.001 + (blendAngle * Math.PI) / 180;
      const warpOffsetX =
        Math.sin(time * warpSpeed * warpFrequency) *
        warpAmplitude *
        warpStrength;
      const warpOffsetY =
        Math.cos(time * warpSpeed * warpFrequency * 0.7) *
        warpAmplitude *
        warpStrength;

      const centerOffsetX = centerX * canvas.width * 0.5;
      const centerOffsetY = centerY * canvas.height * 0.5;

      const gradient = ctx.createLinearGradient(
        canvas.width * 0.5 +
          centerOffsetX +
          warpOffsetX +
          Math.cos(angle) * canvas.width * zoom,
        canvas.height * 0.5 +
          centerOffsetY +
          warpOffsetY +
          Math.sin(angle) * canvas.height * zoom,
        canvas.width * 0.5 +
          centerOffsetX -
          warpOffsetX -
          Math.cos(angle) * canvas.width * zoom,
        canvas.height * 0.5 +
          centerOffsetY -
          warpOffsetY -
          Math.sin(angle) * canvas.height * zoom,
      );

      // 2. Calculate animated color stops with color balance
      const colorMix1 = interpolateColors(
        colors[0],
        colors[1],
        Math.abs(Math.sin(time * 0.3)) * (1 + colorBalance),
      );
      const colorMix2 = interpolateColors(
        colors[1],
        colors[2],
        Math.abs(Math.cos(time * 0.5)) * (1 - colorBalance),
      );
      const colorMix3 = interpolateColors(
        colors[2],
        colors[0],
        Math.abs(Math.sin(time * 0.4)),
      );

      // 3. Add color stops with blend softness
      const softness = blendSoftness;
      gradient.addColorStop(0, rgbToString(colorMix1));
      gradient.addColorStop(0.5 - softness, rgbToString(colorMix2));
      gradient.addColorStop(0.5 + softness, rgbToString(colorMix2));
      gradient.addColorStop(1, rgbToString(colorMix3));

      // 4. Fill canvas with gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 5. Apply post-processing effects (every 2-3 frames for performance)
      if (frameCount % GRAIN_UPDATE_INTERVAL === 0) {
        applyPostProcessing(ctx, canvas.width, canvas.height, {
          contrast,
          gamma,
          saturation,
          noiseScale,
          grainAmount,
          grainScale,
          grainAnimated,
          time: grainAnimated ? time : 0,
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, [
    color1,
    color2,
    color3,
    timeSpeed,
    colorBalance,
    warpStrength,
    warpFrequency,
    warpSpeed,
    warpAmplitude,
    blendAngle,
    blendSoftness,
    rotationAmount,
    noiseScale,
    grainAmount,
    grainScale,
    grainAnimated,
    contrast,
    gamma,
    saturation,
    centerX,
    centerY,
    zoom,
  ]);

  return (
    <canvas
      ref={canvasRef}
      id="grainient-bg"
      className={`grainient-background ${className || ""}`}
      style={{
        width: "100vw",
        height: "100vh",
        ...style,
      }}
    />
  );
}
