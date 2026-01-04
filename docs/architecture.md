# Architecture and Systems Overview

This document captures the editor/runtime split, schemas, and implementation paths for building an Amplify + Niagara style experience in the browser using React Three Fiber and Three.js.

## Core principles
- **Always runnable**: keep a fallback scene and guard all async asset loads with sensible defaults; prefer feature flags and progressive enhancement over breaking changes.
- **Editor-first model**: authoring data is engine-agnostic JSON that compiles down to runtime artifacts (Three.js NodeMaterial/TSL shaders and GPU particle kernels).
- **Separation of concerns**: authoring model → compiler → runtime. Each layer should be testable in isolation.
- **Export lanes, not silver bullets**: glTF for geometry/PBR, MaterialX for portable graphs where supported, and project-native JSON for full-fidelity materials/FX.

## Packages and stack
- **App shell**: Next.js (App Router) + TypeScript.
- **Scene orchestration**: React Three Fiber.
- **Utilities**: @react-three/drei (controls, loaders, environments), @react-three/postprocessing (bloom/vignette/etc.).
- **State**: Zustand for editor/runtime bridge; React Query for async assets.
- **Graphs/UI**: React Flow for node editors; Monaco for shader code view/editor; Leva (optional) for parameter panels.
- **Shaders**: Three.js NodeMaterial/TSL for graph compilation; GLSL snippets for custom nodes; plan for WGSL compatibility later.

## Project layout (proposed)
```
app/
  page.tsx                 # Editor shell with viewport + panels
  api/                     # Upload endpoints (if needed)
components/
  viewport/                # R3F Canvas, camera rig, scene graph wrapper
  panels/                  # Inspector, graph editors, asset browser
  shader-editor/           # Monaco + React Flow bridge
  fx-editor/               # Niagara-like emitter/module UI
lib/
  loaders/                 # GLB/GLTF + texture loaders
  materials/               # Node graph compiler → NodeMaterial/TSL
  fx/                      # Particle data structures and GPU kernels
  export/                  # glTF + MaterialX + JSON writers
  state/                   # Zustand slices and selectors
public/
  fallback-assets/         # (Placeholder) fallback slots; current build uses procedural shapes for always-runnable scenes
```

## Service layer and module boundaries
- Treat **services as API surfaces** consumed by the UI: pure or side-effect-light modules that expose async functions, return typed results, and never reach into view internals.
- Example service categories:
  - `AssetService`: upload/load GLB/GLTF, manage HDRI/texture assets, and provide fallbacks when a request fails.
  - `MaterialService`: create/update/compile material graphs, expose preset catalogs, and surface validation results.
  - `FxService`: manage emitters/systems, run simulations, and expose performance-safe defaults.
  - `SceneService`: orchestrate bindings between models, materials, FX, and post-processing profiles.
- Prefer **dependency injection** for services in React components (context providers/hooks) so tests can swap implementations.
- Avoid raw string keys in services; surface enums or literal unions for identifiers (e.g., material variants, module kinds).
- Keep the app **ready-to-use without login**: service calls must work for anonymous users and fall back to offline-safe defaults.

## Authoring models (JSON)

### Material graph
```ts
type MaterialGraph = {
  id: string;
  name: string;
  nodes: MaterialNode[];
  edges: Edge[];
  uniforms: UniformSpec[]; // exposed parameters
  textures: TextureSpec[];
  variant?: 'StandardPBR' | 'Toon' | 'Custom';
};
```

Key node categories:
- Inputs: Float/Vec2/Vec3/Color/Texture2D/Time/UV/NormalWS/PositionWS/ViewDir/Fresnel/Noise
- Math: Add/Mul/Lerp/Clamp/Pow/Smoothstep/Sine/Abs/Remap/HSV/Posterize/GradientRamp
- Outputs: BaseColor/Emissive/Roughness/Metalness/Normal/Opacity/AlphaClip
- Custom: CodeNode (GLSL snippet with typed inputs/outputs)

Compilation path: `MaterialGraph → TSL AST → Three.js NodeMaterial` with guards for missing connections and defaults for required outputs.

### FX system (Niagara-like)
```ts
type FxSystem = {
  id: string;
  name: string;
  emitters: Emitter[];
  bindings?: AttachmentBinding[]; // sockets/bones/world anchors
};

type Emitter = {
  id: string;
  spawn: SpawnModule[];
  initialize: InitModule[];
  update: UpdateModule[];
  renderers: RendererModule[];
  events?: EventModule[];
};
```

Particle attribute schema (SoA friendly): `position, velocity, age, lifetime, size, color, rotation, angularVelocity, randomSeed, custom1..n`.

Initial module set:
- Spawn: Rate, Burst, ShapeSpawn (Sphere/Cone/Box/MeshSurface)
- Initialize: SetColor, SetSize, SetLifetime, InheritVelocity
- Update: Gravity, Drag, CurlNoiseForce, Vortex, Attractor, ColorOverLife, SizeOverLife, SubUVFlipbook, Collision (CPU fallback)
- Renderers: Billboard sprites (GPU-friendly), Mesh particles (selective), Ribbons (later)
- Events: OnDeath, OnCollision, SpawnEmitter

Simulation path: prefer GPU (transform feedback or compute-like via ping-pong buffers); keep a CPU fallback for wide compatibility. Clamp particle counts and expose a “performance mode.”

### Bindings
`AttachmentBinding` maps gameplay parameters and sockets to shader uniforms and FX parameters. Example: `spellIntensity` drives emissive level, bloom threshold, and spawn rate.

## UI/UX flows
- **Viewport**: R3F Canvas with camera rig (arcball/fly), grid toggle, and quick lighting presets.
- **Asset upload**: drop-zone + progress; on success, auto-fit camera; on failure, revert to fallback asset.
- **Material editor**: React Flow graph + Monaco; live preview on the selected mesh; parameter inspector for exposed uniforms.
- **FX editor**: emitter/module list with sortable stacks; inline curve/gradient editors for over-life controls; gizmos for spawn volumes.
- **Presets**: save/load material graphs, FX systems, and post-processing profiles as JSON.

## Post-processing and lookdev
Use `@react-three/postprocessing` for bloom, vignette, color grading, and chromatic aberration. Provide “dark fantasy” presets and expose tunable parameters in the inspector.

## Testing and reliability
- Unit-test graph compilers (material and FX) with Jest/TS.
- Visual regression harness (Chromatic/Playwright) for key presets.
- Runtime guards: fallback materials when a node is invalid; cap particle counts; timeouts for uploads.

## Export strategy
- **glTF**: geometry + standard PBR textures/parameters; skip custom nodes.
- **MaterialX**: generate graphs where nodes map to Standard Surface; warn when unsupported features are present.
- **Native JSON**: canonical source of truth for full-fidelity materials/FX; use for round-trip within the web editor.
- **Engine bridges**: provide starter importers (Unreal/Unity) that consume MaterialX + JSON metadata.
