import { MaterialIdentifier } from '../models/identifiers';
import { MaterialVariant } from '../models/material';

export interface MaterialsServiceDependencies {
  listVariants(): Promise<readonly MaterialVariant[]>;
  fetchVariant(id: MaterialIdentifier): Promise<MaterialVariant>;
}

export interface MaterialsService {
  listVariants(): Promise<readonly MaterialVariant[]>;
  getVariant(id: MaterialIdentifier): Promise<MaterialVariant>;
}

export function createMaterialsService(
  dependencies: MaterialsServiceDependencies,
): MaterialsService {
  const { fetchVariant, listVariants } = dependencies;

  async function getVariant(id: MaterialIdentifier): Promise<MaterialVariant> {
    return fetchVariant(id);
  }

  return {
    listVariants,
    getVariant,
  };
}
