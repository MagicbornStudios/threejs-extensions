import { ReactNode, createContext, useContext } from 'react';
import { AssetsService } from './assets';
import { FxService } from './fx';
import { MaterialsService } from './materials';
import { SceneService } from './scene';

export interface ServicesBundle {
  readonly assets: AssetsService;
  readonly materials: MaterialsService;
  readonly fx: FxService;
  readonly scene: SceneService;
}

const ServicesContext = createContext<ServicesBundle | null>(null);

const missingServicesMessage = 'services context is not available';

export function ServicesProvider({
  services,
  children,
}: {
  readonly services: ServicesBundle;
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

function useServices(): ServicesBundle {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error(missingServicesMessage);
  }
  return services;
}

export function useAssetsService(): AssetsService {
  return useServices().assets;
}

export function useMaterialsService(): MaterialsService {
  return useServices().materials;
}

export function useFxService(): FxService {
  return useServices().fx;
}

export function useSceneService(): SceneService {
  return useServices().scene;
}
