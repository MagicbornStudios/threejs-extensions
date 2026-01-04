'use client';

import type { ReactElement } from 'react';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useViewerSettings } from '@/stores/viewerSettings';

export function VisualEffects() {
  const { postProcessing } = useViewerSettings();

  if (!postProcessing.bloomEnabled && !postProcessing.vignetteEnabled) {
    return null;
  }

  const effects: ReactElement[] = [];

  if (postProcessing.bloomEnabled) {
    effects.push(
      <Bloom
        key="bloom"
        intensity={postProcessing.bloomIntensity}
        luminanceThreshold={postProcessing.bloomThreshold}
        luminanceSmoothing={postProcessing.bloomSmoothing}
        mipmapBlur
      />,
    );
  }

  if (postProcessing.vignetteEnabled) {
    effects.push(
      <Vignette
        key="vignette"
        eskil
        offset={postProcessing.vignetteOffset}
        darkness={postProcessing.vignetteDarkness}
      />,
    );
  }

  return (
    <EffectComposer multisampling={0}>
      {effects}
    </EffectComposer>
  );
}
