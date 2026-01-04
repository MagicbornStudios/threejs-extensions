'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Grid, Lightformer, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import { Color } from 'three';
import { ModelStage } from './ModelStage';
import { ModelErrorBoundary } from './ModelErrorBoundary';
import { VisualEffects } from './VisualEffects';
import type { ModelSource } from '@/services/modelSource';
import { MATERIAL_PRESETS, type MaterialPresetId } from '@/models/materialPresets';
import { useViewerSettings } from '@/stores/viewerSettings';

const BACKGROUND = new Color('#0b0d12');
const GRID_COLOR = new Color('#1f2937');
const GRID_FADE_COLOR = new Color('#111827');
const CAMERA_POSITION: [number, number, number] = [4.5, 3.25, 5.25];

interface SceneCanvasProps {
  readonly modelSource: ModelSource;
  readonly materialPresetId: MaterialPresetId;
  readonly onModelError: () => void;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 6]} intensity={2.1} castShadow />
      <spotLight position={[-6, 5, -4]} angle={0.65} intensity={0.8} penumbra={0.6} />
    </>
  );
}

function StageHelpers() {
  return (
    <>
      <Grid
        args={[40, 40]}
        position={[0, -0.01, 0]}
        cellColor={GRID_COLOR}
        sectionColor={GRID_FADE_COLOR}
        sectionThickness={1.5}
        cellThickness={0.6}
        fadeDistance={22}
        fadeStrength={0.8}
        infiniteGrid
      />
    </>
  );
}

export function SceneCanvas({ modelSource, materialPresetId, onModelError }: SceneCanvasProps) {
  const presetLabel = useMemo(() => MATERIAL_PRESETS[materialPresetId].label, [materialPresetId]);
  const performanceOverlayEnabled = useViewerSettings((state) => state.performanceOverlayEnabled);

  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      dpr={[1, 2]}
      className="canvas-wrapper"
    >
      <color attach="background" args={[BACKGROUND]} />
      <fog attach="fog" args={[BACKGROUND, 10, 40]} />
      <PerspectiveCamera makeDefault position={CAMERA_POSITION} fov={50} />
      <OrbitControls enableDamping dampingFactor={0.08} minDistance={2} maxDistance={18} />
      <Lights />
      <StageHelpers />
      <Suspense fallback={null}>
        <Environment resolution={256} background={false}>
          <Lightformer
            form="ring"
            intensity={1.2}
            position={[0, 2.5, 4.5]}
            scale={[3.6, 3.6, 1]}
            color="#91a4ff"
          />
          <Lightformer
            form="rect"
            intensity={0.9}
            position={[0, -2.5, -4]}
            rotation={[Math.PI, 0, 0]}
            scale={[6.5, 6.5, 1]}
            color="#0d1117"
          />
        </Environment>
      </Suspense>
      <ModelErrorBoundary
        resetKeys={[modelSource.kind === 'gltf' ? modelSource.url : modelSource.label, presetLabel]}
        onError={onModelError}
      >
        <ModelStage source={modelSource} materialPresetId={materialPresetId} />
      </ModelErrorBoundary>
      <VisualEffects />
      {performanceOverlayEnabled ? <Perf position="top-left" className="perf-overlay" /> : null}
    </Canvas>
  );
}
