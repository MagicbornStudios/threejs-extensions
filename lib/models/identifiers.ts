export const AssetIdentifier = {
  DefaultModel: 'asset.default-model',
  DefaultEnvironment: 'asset.default-environment',
  FallbackTexture: 'asset.fallback-texture',
} as const;

export type AssetIdentifier = (typeof AssetIdentifier)[keyof typeof AssetIdentifier];

export const MaterialIdentifier = {
  DefaultLit: 'material.default-lit',
  DefaultUnlit: 'material.default-unlit',
  WireframeDebug: 'material.wireframe-debug',
} as const;

export type MaterialIdentifier =
  (typeof MaterialIdentifier)[keyof typeof MaterialIdentifier];

export const FxSystemIdentifier = {
  Bloom: 'fx.bloom',
  ToneMapping: 'fx.tone-mapping',
  DebugNormals: 'fx.debug-normals',
} as const;

export type FxSystemIdentifier =
  (typeof FxSystemIdentifier)[keyof typeof FxSystemIdentifier];

export const AttachmentSlot = {
  Environment: 'slot.environment',
  Skybox: 'slot.skybox',
  MainModel: 'slot.main-model',
} as const;

export type AttachmentSlot = (typeof AttachmentSlot)[keyof typeof AttachmentSlot];

export const MaterialProfile = {
  PhysicallyBased: 'profile.pbr',
  Unlit: 'profile.unlit',
} as const;

export type MaterialProfile = (typeof MaterialProfile)[keyof typeof MaterialProfile];

export const AssetKind = {
  Model: 'kind.model',
  Texture: 'kind.texture',
  Environment: 'kind.environment',
} as const;

export type AssetKind = (typeof AssetKind)[keyof typeof AssetKind];
