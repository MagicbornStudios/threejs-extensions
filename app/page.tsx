'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_MATERIAL_PRESET_ID, MATERIAL_PRESETS, type MaterialPresetId } from '@/models/materialPresets';
import { UploadDropzone } from '@/components/ui/UploadDropzone';
import { EffectsControlPanel, ResetEffectsButton } from '@/components/ui/EffectsControlPanel';
import { ShaderEditor } from '@/components/shader-editor/ShaderEditor';
import { MaterialSelectionBadge } from '@/components/ui/MaterialSelectionBadge';
import {
  createFallbackModelSource,
  createModelSourceFromFile,
  releaseModelSource,
  type ModelSource,
} from '@/services/modelSource';
import { SceneCanvas } from '@/components/canvas/SceneCanvas';

const ACCEPTED_EXTENSIONS: readonly string[] = ['.glb', '.gltf'];

type StatusKind = 'idle' | 'loaded' | 'fallback' | 'rejected';

interface StatusMessage {
  readonly kind: StatusKind;
  readonly text: string;
}

const statusCopy: Record<StatusKind, string> = {
  idle: 'Drop a GLB/GLTF file to preview. A procedural fallback mesh renders by default.',
  loaded: 'Custom model loaded successfully.',
  fallback: 'Encountered an issue. Reverted to the procedural fallback.',
  rejected: 'That file type is not supported. Please provide a GLB or GLTF.',
};

export default function HomePage() {
  const [modelSource, setModelSource] = useState<ModelSource>(() => createFallbackModelSource());
  const [status, setStatus] = useState<StatusMessage>({ kind: 'idle', text: statusCopy.idle });
  const [materialPresetId, setMaterialPresetId] = useState<MaterialPresetId>(DEFAULT_MATERIAL_PRESET_ID);

  useEffect(() => {
    return () => releaseModelSource(modelSource);
  }, [modelSource]);

  const handleModelError = useCallback(() => {
    setModelSource((previous) => {
      releaseModelSource(previous);
      return createFallbackModelSource();
    });
    setStatus({ kind: 'fallback', text: statusCopy.fallback });
  }, []);

  const handleFileAccepted = useCallback((file: File) => {
    const nextSource = createModelSourceFromFile(file);
    if (!nextSource) {
      setStatus({ kind: 'rejected', text: statusCopy.rejected });
      return;
    }

    setModelSource((previous) => {
      releaseModelSource(previous);
      return nextSource;
    });
    setStatus({ kind: 'loaded', text: statusCopy.loaded });
  }, []);

  const handleReject = useCallback(() => {
    setStatus({ kind: 'rejected', text: statusCopy.rejected });
    setModelSource((previous) => {
      releaseModelSource(previous);
      return createFallbackModelSource();
    });
  }, []);

  const presetOptions = useMemo(() => Object.values(MATERIAL_PRESETS), []);

  const handlePresetChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setMaterialPresetId(event.target.value as MaterialPresetId);
  }, []);

  return (
    <div className="layout">
      <header className="header">
        <h1>Phase 1 Viewer</h1>
        <p>Next.js App Router + R3F with fallbacks, uploads, and cinematic post effects.</p>
      </header>

      <main className="main">
        <section className="panel">
          <UploadDropzone
            onFileAccepted={handleFileAccepted}
            onReject={handleReject}
            acceptedExtensions={ACCEPTED_EXTENSIONS}
          />

          <EffectsControlPanel />

          <div className="select-row">
            <label htmlFor="materialPreset">Material preset</label>
            <select id="materialPreset" value={materialPresetId} onChange={handlePresetChange}>
              {presetOptions.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div className="status">{status.text}</div>
          <div className="status">Active model: {modelSource.label}</div>
          <ResetEffectsButton />
        </section>

        <div className="workspace">
          <section className="canvas-panel">
            <SceneCanvas modelSource={modelSource} materialPresetId={materialPresetId} onModelError={handleModelError} />
            <div className="canvas-overlay">
              <MaterialSelectionBadge />
            </div>
          </section>

          <section className="panel shader-panel">
            <div className="panel-header">
              <div>
                <h3>Shader Graph</h3>
                <p>React Flow + Monaco with defaults when links are missing.</p>
              </div>
            </div>
            <ShaderEditor />
          </section>
        </div>
      </main>
    </div>
  );
}
