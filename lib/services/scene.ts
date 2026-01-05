import {
  AttachmentBinding,
  AttachmentSlot,
  AssetIdentifier,
  FxSystemIdentifier,
  MaterialIdentifier,
} from '../models';

export interface SceneSnapshot {
  readonly bindings: readonly AttachmentBinding[];
  readonly activeMaterial?: MaterialIdentifier;
  readonly activeFx?: readonly FxSystemIdentifier[];
}

export interface SceneServiceDependencies {
  loadBindings(): Promise<readonly AttachmentBinding[]>;
  persistBinding(binding: AttachmentBinding): Promise<void>;
  removeBinding(slot: AttachmentSlot): Promise<void>;
  persistMaterial?(material: MaterialIdentifier | undefined): Promise<void>;
  persistFxChain?(ids: readonly FxSystemIdentifier[]): Promise<void>;
}

export interface SceneService {
  snapshot(): Promise<SceneSnapshot>;
  attachAsset(slot: AttachmentSlot, asset: AssetIdentifier): Promise<void>;
  detach(slot: AttachmentSlot): Promise<void>;
  setMaterial(material: MaterialIdentifier | undefined): Promise<void>;
  setFxChain(ids: readonly FxSystemIdentifier[]): Promise<void>;
}

export function createSceneService(
  dependencies: SceneServiceDependencies,
): SceneService {
  const {
    loadBindings,
    persistBinding,
    removeBinding,
    persistFxChain,
    persistMaterial,
  } = dependencies;

  async function snapshot(): Promise<SceneSnapshot> {
    const bindings = await loadBindings();
    return { bindings };
  }

  async function attachAsset(
    slot: AttachmentSlot,
    asset: AssetIdentifier,
  ): Promise<void> {
    const binding: AttachmentBinding = { asset, slot };
    await persistBinding(binding);
  }

  async function detach(slot: AttachmentSlot): Promise<void> {
    await removeBinding(slot);
  }

  async function setMaterial(
    material: MaterialIdentifier | undefined,
  ): Promise<void> {
    await persistMaterial?.(material);
  }

  async function setFxChain(
    ids: readonly FxSystemIdentifier[],
  ): Promise<void> {
    await persistFxChain?.(ids);
  }

  return {
    snapshot,
    attachAsset,
    detach,
    setMaterial,
    setFxChain,
  };
}
