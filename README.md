# Three.js FX Authoring Playground

A browser-based shader and VFX playground built with React Three Fiber and Three.js, inspired by Unreal Niagara and Amplify Shader Editor. The guiding principles are:

- **Always runnable in the browser**: every milestone ships with a working scene and safe fallbacks.
- **Zero-friction access**: no authentication required; the editor loads with a ready-to-use fallback scene.
- **Editor-first authoring**: node graphs + inline shader code with live preview.
- **Future-friendly exports**: keep your high-fidelity graphs in JSON, and target glTF/MaterialX where possible.

## High-level capabilities (goal)
- Upload GLB/GLTF models, auto-frame the camera, and swap materials.
- Node-based material editor powered by Three.js NodeMaterial/TSL, with a side-by-side GLSL code view/editor.
- Niagara-like FX stack: emitters, particle modules (spawn/update), and sprite/mesh renderers.
- Parameter bindings to attach effects to bones/sockets or world anchors.
- Post-processing presets (bloom, vignette, chromatic aberration) for “dark fantasy” looks.

## Current repo state
This repository now ships with the Phase 1 scaffold: a Next.js (App Router) + React Three Fiber scene that boots with a procedural fallback, an orbit camera rig, an FX control panel, and upload support.

For implementation guidance and coding standards, start with `AGENTS.md` and `docs/services.md` to keep contributions modular, service-driven, and free from ad-hoc string literals.

## Getting started

1. Install dependencies: `npm install`
2. Run the dev server: `npm run dev`
3. Open the app at `http://localhost:3000`

## Phase 1 scaffold

- Renders a procedural fallback mesh and stylized lighting so the scene always works without external assets.
- Provides an upload dropzone that accepts GLB/GLTF and reverts to the fallback on errors.
- Includes emissive/rim material presets plus bloom and vignette post-processing.
- Ships with a Leva-powered FX panel and Zustand store to tweak bloom/vignette and toggle a performance overlay without code changes.

## Roadmap snapshot
- **Phase 1 (bootstrap)**: Next.js + R3F scene, GLB upload, camera controls, basic lighting, emissive/rim presets, bloom postprocess. Always keep a fallback model/scene for when no asset is uploaded.
- **Phase 2 (material graph MVP)**: React Flow graph, compile to NodeMaterial/TSL, CodeNode for inline GLSL, Monaco editor integration with live preview.
- **Phase 3 (FX MVP)**: Single GPU sprite emitter with spawn rate/burst, color/size over life, noise/drag forces; attach to model bones or world anchors.
- **Phase 4 (editor polish)**: Subgraphs, comments, search palette, gradient/curve editors, ribbons/trails, presets with save/load.
- **Phase 5 (export lanes)**: glTF for geometry + standard PBR; MaterialX for compatible graphs; JSON for full-fidelity editor graphs; starter importers for Unreal/Unity.

See `docs/architecture.md` and `docs/milestones.md` for implementation details.
