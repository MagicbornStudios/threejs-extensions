'use client';

import { Suspense, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { ObjectMap, useFrame } from '@react-three/fiber';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DoubleSide, Group, Mesh, MeshPhysicalMaterial, Object3D, Material } from 'three';
import { easing } from 'maath';
import { MATERIAL_PRESETS, type MaterialPreset, type MaterialPresetId } from '@/models/materialPresets';
import type { ModelSource } from '@/services/modelSource';
import { useMaterialGraphStore } from '@/stores/materialGraph';

type GltfModelProps = {
  readonly source: Extract<ModelSource, { kind: 'gltf' }>;
  readonly materialPresetId: MaterialPresetId;
};

interface ModelStageProps {
  readonly source: ModelSource;
  readonly materialPresetId: MaterialPresetId;
}

function applyMaterialPreset(mesh: Mesh, preset: MaterialPreset, overrideMaterial?: Material): void {
  if (overrideMaterial) {
    mesh.material = overrideMaterial;
    return;
  }

  const material = (mesh.material as MeshPhysicalMaterial).clone();
  material.color.set(preset.baseColor);
  material.metalness = preset.metalness ?? material.metalness;
  material.roughness = preset.roughness ?? material.roughness;
  material.emissive.set(preset.emissive ?? '#000000');
  material.emissiveIntensity = preset.emissiveIntensity ?? 0.0;
  material.side = DoubleSide;

  if (preset.sheen !== undefined) {
    material.sheen = preset.sheen;
  }
  if (preset.sheenColor !== undefined) {
    material.sheenColor.set(preset.sheenColor);
  }

  mesh.material = material;
}

function materializeScene(scene: Object3D, preset: MaterialPreset, overrideMaterial?: Material): Object3D {
  const clone = scene.clone(true);
  clone.traverse((child) => {
    if ((child as Mesh).isMesh) {
      applyMaterialPreset(child as Mesh, preset, overrideMaterial);
    }
  });
  return clone;
}

function createMaterialForPreset(preset: MaterialPreset): MeshPhysicalMaterial {
  const material = new MeshPhysicalMaterial({
    color: preset.baseColor,
    metalness: preset.metalness,
    roughness: preset.roughness,
    emissive: preset.emissive ?? '#000000',
    emissiveIntensity: preset.emissiveIntensity ?? 0.0,
    side: DoubleSide,
  });

  if (preset.sheen !== undefined) {
    material.sheen = preset.sheen;
  }
  if (preset.sheenColor !== undefined) {
    material.sheenColor.set(preset.sheenColor);
  }

  return material;
}

function GltfModel({ source, materialPresetId }: GltfModelProps) {
  type LoadedGLTF = GLTF & ObjectMap;

  const gltf = useGLTF(source.url) as unknown as LoadedGLTF;
  const preset = MATERIAL_PRESETS[materialPresetId];
  const groupRef = useRef<Group>(null);
  const compiledMaterial = useMaterialGraphStore((state) => state.compiledMaterial);
  const selectedNodeId = useMaterialGraphStore((state) => state.selectedNodeId);

  const prepared = useMemo(
    () => materializeScene(gltf.scene, preset, compiledMaterial),
    [compiledMaterial, gltf.scene, preset],
  );

  useFrame((state, delta) => {
    if (!groupRef.current) {
      return;
    }

    const selectionScale = selectedNodeId ? 1.06 : 1;
    easing.dampE(groupRef.current.rotation, [0, state.clock.elapsedTime * 0.15, 0], 0.18, delta);
    easing.damp3(groupRef.current.scale, [selectionScale, selectionScale, selectionScale], 0.2, delta);
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={prepared} />
    </group>
  );
}

function ProceduralFallback({ materialPresetId }: { materialPresetId: MaterialPresetId }) {
  const preset = MATERIAL_PRESETS[materialPresetId];
  const groupRef = useRef<Group>(null);
  const compiledMaterial = useMaterialGraphStore((state) => state.compiledMaterial);
  const selectedNodeId = useMaterialGraphStore((state) => state.selectedNodeId);
  const material = useMemo(() => {
    if (compiledMaterial) {
      const clone = compiledMaterial.clone();
      clone.side = DoubleSide;
      return clone;
    }
    return createMaterialForPreset(preset);
  }, [compiledMaterial, preset]);

  useFrame((state, delta) => {
    if (!groupRef.current) {
      return;
    }

    const targetRotation: [number, number, number] = [
      Math.sin(state.clock.elapsedTime * 0.3) * 0.35,
      state.clock.elapsedTime * 0.22,
      Math.cos(state.clock.elapsedTime * 0.25) * 0.25,
    ];
    easing.dampE(groupRef.current.rotation, targetRotation, 0.18, delta);
    const selectionScale = selectedNodeId ? 1.08 : 1;
    easing.damp3(groupRef.current.position, [0, 0.15, 0], 0.18, delta);
    easing.damp3(groupRef.current.scale, [selectionScale, selectionScale, selectionScale], 0.2, delta);
  });

  return (
    <group ref={groupRef} dispose={null}>
      <mesh castShadow receiveShadow material={material}>
        <torusKnotGeometry args={[1.05, 0.35, 220, 32]} />
      </mesh>
    </group>
  );
}

export function ModelStage({ source, materialPresetId }: ModelStageProps) {
  if (source.kind === 'primitive') {
    return <ProceduralFallback materialPresetId={materialPresetId} />;
  }

  return (
    <Suspense fallback={null}>
      <GltfModel source={source} materialPresetId={materialPresetId} />
    </Suspense>
  );
}
