'use client';

import { usePathname } from 'next/navigation';
import Grainient from './base/Grainient';

/** Full-screen animated gradient background shown on all pages except /canvas. */
export default function GrainientBackground() {
  const pathname = usePathname();

  if (pathname === '/canvas') return null;

  return (
    <div className="grainient-bg-wrapper">
      <Grainient
        color1="#9333ea"
        color2="#ffffff"
        color3="#D4C2FC"
        timeSpeed={0.25}
        colorBalance={0}
        warpStrength={0.55}
        warpFrequency={1.3}
        warpSpeed={2}
        warpAmplitude={50}
        blendAngle={0}
        blendSoftness={0.01}
        rotationAmount={500}
        noiseScale={1.5}
        grainAmount={0.05}
        grainScale={2}
        grainAnimated={false}
        contrast={1.5}
        gamma={1}
        saturation={1}
        centerX={0}
        centerY={0}
        zoom={0.9}
      />
    </div>
  );
}
