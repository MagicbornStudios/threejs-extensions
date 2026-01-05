import { FxSystemIdentifier } from '../models/identifiers';
import { FxSystem } from '../models/fx';

export interface FxServiceDependencies {
  listSystems(): Promise<readonly FxSystem[]>;
  fetchSystem(id: FxSystemIdentifier): Promise<FxSystem>;
  persistEnabledState?(id: FxSystemIdentifier, enabled: boolean): Promise<void>;
}

export interface FxService {
  listSystems(): Promise<readonly FxSystem[]>;
  getSystem(id: FxSystemIdentifier): Promise<FxSystem>;
  setEnabled(id: FxSystemIdentifier, enabled: boolean): Promise<void>;
}

export function createFxService(dependencies: FxServiceDependencies): FxService {
  const { fetchSystem, listSystems, persistEnabledState } = dependencies;

  async function getSystem(id: FxSystemIdentifier): Promise<FxSystem> {
    return fetchSystem(id);
  }

  async function setEnabled(
    id: FxSystemIdentifier,
    enabled: boolean,
  ): Promise<void> {
    await persistEnabledState?.(id, enabled);
  }

  return {
    listSystems,
    getSystem,
    setEnabled,
  };
}
