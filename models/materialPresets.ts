import type { ColorRepresentation } from 'three';

export type MaterialPresetId = 'neutral' | 'emissive' | 'rim';

export interface MaterialPreset {
  readonly id: MaterialPresetId;
  readonly label: string;
  readonly baseColor: ColorRepresentation;
  readonly emissive?: ColorRepresentation;
  readonly emissiveIntensity?: number;
  readonly metalness?: number;
  readonly roughness?: number;
  readonly sheen?: number;
  readonly sheenColor?: ColorRepresentation;
}

export const MATERIAL_PRESETS: Readonly<Record<MaterialPresetId, MaterialPreset>> = {
  neutral: {
    id: 'neutral',
    label: 'Neutral Matte',
    baseColor: '#d6d8e1',
    metalness: 0.12,
    roughness: 0.62,
  },
  emissive: {
    id: 'emissive',
    label: 'Soft Emissive',
    baseColor: '#7dd3fc',
    emissive: '#22d3ee',
    emissiveIntensity: 0.9,
    metalness: 0.08,
    roughness: 0.4,
  },
  rim: {
    id: 'rim',
    label: 'Rim Highlight',
    baseColor: '#e0e7ff',
    metalness: 0.45,
    roughness: 0.15,
    sheen: 0.6,
    sheenColor: '#c4d4ff',
  },
};

export const DEFAULT_MATERIAL_PRESET_ID: MaterialPresetId = 'neutral';
