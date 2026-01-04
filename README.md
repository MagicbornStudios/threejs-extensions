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
This repository is in a **design + planning** state. The documents in `docs/` define the architecture, schemas, and milestones to reach a production-ready, always-runnable web app.

For implementation guidance and coding standards, start with `AGENTS.md` and `docs/services.md` to keep contributions modular, service-driven, and free from ad-hoc string literals.

## Roadmap snapshot
- **Phase 1 (bootstrap)**: Next.js + R3F scene, GLB upload, camera controls, basic lighting, emissive/rim presets, bloom postprocess. Always keep a fallback model/scene for when no asset is uploaded.
- **Phase 2 (material graph MVP)**: React Flow graph, compile to NodeMaterial/TSL, CodeNode for inline GLSL, Monaco editor integration with live preview.
- **Phase 3 (FX MVP)**: Single GPU sprite emitter with spawn rate/burst, color/size over life, noise/drag forces; attach to model bones or world anchors.
- **Phase 4 (editor polish)**: Subgraphs, comments, search palette, gradient/curve editors, ribbons/trails, presets with save/load.
- **Phase 5 (export lanes)**: glTF for geometry + standard PBR; MaterialX for compatible graphs; JSON for full-fidelity editor graphs; starter importers for Unreal/Unity.

See `docs/architecture.md` and `docs/milestones.md` for implementation details.
