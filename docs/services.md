# Service and Module Design Guide

This guide defines how to structure API-like service modules so the UI can manipulate models, materials, shaders, and FX without tight coupling. It aligns with the repository-wide expectations in `AGENTS.md`.

## Principles
- **API-like contracts**: Services expose typed async functions, return results/typed errors, and avoid direct UI imports.
- **No raw string keys**: Export enums or literal unions for identifiers (material variants, module kinds, storage buckets) instead of ad-hoc strings.
- **Injectability**: Provide factories that accept dependencies (e.g., loaders, storage adapters) so tests and environments can swap implementations.
- **Fallback-first**: Each service must supply safe defaults (fallback assets, default shaders/materials) to keep the app runnable without auth or network.

## Suggested folders
- `lib/services/assets` — GLB/GLTF upload + caching + HDRI/texture fetching with fallbacks.
- `lib/services/materials` — Graph CRUD, preset catalog, validation, compilation to NodeMaterial/TSL.
- `lib/services/fx` — Emitter/system CRUD, simulation hooks, performance-safe defaults.
- `lib/services/scene` — Bindings between models, materials, FX, and post-processing profiles.

## Example patterns
```ts
// models/material.ts
export const MaterialVariant = {
  StandardPbr: 'StandardPbr',
  Toon: 'Toon',
  Custom: 'Custom',
} as const;
export type MaterialVariant = (typeof MaterialVariant)[keyof typeof MaterialVariant];

export interface MaterialGraphSummary {
  id: string;
  name: string;
  variant: MaterialVariant;
}

// services/materials/createMaterialService.ts
import { MaterialGraphSummary, MaterialVariant } from '../../models/material';

export interface MaterialServiceDeps {
  fetchJson: (url: URL) => Promise<unknown>;
  saveJson: (path: string, data: unknown) => Promise<void>;
}

export interface MaterialService {
  listPresets(): Promise<MaterialGraphSummary[]>;
  loadGraph(id: string): Promise<MaterialGraphSummary>;
  compileGraph(id: string): Promise<{ materialId: string }>;
}

export const createMaterialService = (deps: MaterialServiceDeps): MaterialService => ({
  async listPresets() {
    const response = await deps.fetchJson(new URL('/materials/index.json', window.location.origin));
    // Parse into typed summaries using shared constants instead of raw strings.
    return Array.isArray(response)
      ? response.map((item) => ({
          id: String(item.id),
          name: String(item.name),
          variant: (item.variant as MaterialVariant) ?? MaterialVariant.StandardPbr,
        }))
      : [];
  },

  async loadGraph(id) {
    const response = await deps.fetchJson(new URL(`/materials/${id}.json`, window.location.origin));
    return {
      id,
      name: String((response as { name?: string }).name ?? 'Material'),
      variant: (response as { variant?: MaterialVariant }).variant ?? MaterialVariant.StandardPbr,
    };
  },

  async compileGraph(id) {
    // Hook into the compiler pipeline; keep side effects in one place.
    return { materialId: id };
  },
});
```

## Frontend integration
- Expose services through React context/hooks to keep components declarative: e.g., `useMaterialService()` returning the API above.
- Keep UI state (Zustand) separate from service logic; services should not mutate global state directly.
- Provide optimistic fallbacks for offline/anonymous usage so the editor renders immediately on page load.

## Testing
- Mock service dependencies (e.g., `fetchJson`) and assert on typed results rather than implementation details.
- Add contract tests for compile/validation paths to guarantee graph safety as the schema evolves.
