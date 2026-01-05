import { AssetIdentifier, AssetKind } from '../models';

export interface AssetDescriptor {
  readonly id: AssetIdentifier;
  readonly kind: AssetKind;
  readonly uri: string;
  readonly label: string;
}

export interface AssetRecord {
  readonly descriptor: AssetDescriptor;
  readonly payload: unknown;
}

export interface AssetsServiceDependencies {
  resolveDescriptor(id: AssetIdentifier): Promise<AssetDescriptor | null>;
  fetchAsset(descriptor: AssetDescriptor): Promise<AssetRecord>;
  listDescriptors(): Promise<readonly AssetDescriptor[]>;
  releaseAsset?(record: AssetRecord): Promise<void> | void;
}

export interface AssetsService {
  listAvailable(): Promise<readonly AssetDescriptor[]>;
  load(id: AssetIdentifier): Promise<AssetRecord>;
  release(record: AssetRecord): Promise<void>;
}

const missingDescriptorMessage = 'asset descriptor not available';

export function createAssetsService(
  dependencies: AssetsServiceDependencies,
): AssetsService {
  const { fetchAsset, listDescriptors, resolveDescriptor, releaseAsset } =
    dependencies;

  async function ensureDescriptor(
    id: AssetIdentifier,
  ): Promise<AssetDescriptor> {
    const descriptor = await resolveDescriptor(id);
    if (!descriptor) {
      throw new Error(missingDescriptorMessage);
    }
    return descriptor;
  }

  async function listAvailable(): Promise<readonly AssetDescriptor[]> {
    return listDescriptors();
  }

  async function load(id: AssetIdentifier): Promise<AssetRecord> {
    const descriptor = await ensureDescriptor(id);
    return fetchAsset(descriptor);
  }

  async function release(record: AssetRecord): Promise<void> {
    await releaseAsset?.(record);
  }

  return {
    listAvailable,
    load,
    release,
  };
}
