'use client';

import { useEffect, useMemo } from 'react';
import { Leva, useControls } from 'leva';
import { DEFAULT_POST_PROCESSING } from '@/models/viewerSettings';
import { useViewerSettings } from '@/stores/viewerSettings';

const CONTROL_GROUP = 'Visual FX';

export function EffectsControlPanel() {
  const { postProcessing, setPostProcessing, performanceOverlayEnabled, setPerformanceOverlayEnabled } =
    useViewerSettings();

  const controlConfig = useMemo(
    () => ({
      bloomEnabled: {
        label: 'Bloom',
        value: postProcessing.bloomEnabled,
      },
      bloomIntensity: {
        label: 'Bloom Intensity',
        value: postProcessing.bloomIntensity,
        min: 0,
        max: 2.5,
        step: 0.01,
      },
      bloomThreshold: {
        label: 'Bloom Threshold',
        value: postProcessing.bloomThreshold,
        min: 0,
        max: 1,
        step: 0.01,
      },
      bloomSmoothing: {
        label: 'Bloom Smoothing',
        value: postProcessing.bloomSmoothing,
        min: 0,
        max: 1,
        step: 0.01,
      },
      vignetteEnabled: {
        label: 'Vignette',
        value: postProcessing.vignetteEnabled,
      },
      vignetteOffset: {
        label: 'Vignette Offset',
        value: postProcessing.vignetteOffset,
        min: 0,
        max: 1,
        step: 0.01,
      },
      vignetteDarkness: {
        label: 'Vignette Darkness',
        value: postProcessing.vignetteDarkness,
        min: 0,
        max: 2,
        step: 0.01,
      },
      performanceOverlayEnabled: {
        label: 'Perf Overlay',
        value: performanceOverlayEnabled,
      },
    }),
    [performanceOverlayEnabled, postProcessing],
  );

  const controls = useControls(CONTROL_GROUP, controlConfig, { collapsed: false });

  useEffect(() => {
    setPostProcessing({
      bloomEnabled: controls.bloomEnabled,
      bloomIntensity: controls.bloomIntensity,
      bloomThreshold: controls.bloomThreshold,
      bloomSmoothing: controls.bloomSmoothing,
      vignetteEnabled: controls.vignetteEnabled,
      vignetteOffset: controls.vignetteOffset,
      vignetteDarkness: controls.vignetteDarkness,
    });
  }, [controls, setPostProcessing]);

  useEffect(() => {
    setPerformanceOverlayEnabled(controls.performanceOverlayEnabled);
  }, [controls.performanceOverlayEnabled, setPerformanceOverlayEnabled]);

  return <Leva collapsed theme={{ sizes: { rootWidth: '320px' } }} />;
}

export function ResetEffectsButton() {
  const { setPostProcessing } = useViewerSettings();

  const handleReset = () => setPostProcessing(DEFAULT_POST_PROCESSING);

  return (
    <button type="button" className="secondary-button" onClick={handleReset}>
      Reset FX to defaults
    </button>
  );
}
