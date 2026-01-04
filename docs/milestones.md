# Milestones and Deliverables

A phased plan to keep the web app always runnable while progressively adding Amplify-like shader authoring and Niagara-like FX.

## Phase 1 — Bootstrap (working scene day 1)
- Next.js + R3F scaffold with fallback GLB (e.g., Suzanne) and HDRI.
- Orbit/arcball camera, grid toggle, directional + rim + fill lights.
- GLB/GLTF upload with progress and error fallback to default asset.
- Material presets: emissive/rim/dissolve/burn/frost shaders built with TSL/NodeMaterial.
- Post-processing: bloom + vignette + exposure control.
- Persistence: localStorage save/load for scene + material presets.

## Phase 2 — Material graph MVP
- React Flow node editor + Monaco code view; two-way selection.
- NodeMaterial/TSL compiler with validation + graceful defaults.
- CodeNode for inline GLSL; hot reload into preview.
- Uniform exposure + inspector sliders/gradients; parameter animation stubs.
- Snapshot/preview thumbnails for materials.

## Phase 3 — FX MVP (Niagara-lite)
- GPU sprite particle system with spawn rate/burst, color/size over life, noise/drag modules.
- Attachment bindings to bones/sockets/world anchors on the uploaded model.
- Gizmos for spawn shapes; per-emitter enable/solo/mute.
- Performance mode switch (caps particle counts, disables heavy modules).

## Phase 4 — Editor polish
- Subgraphs/groups, comments, search palette, keyboard shortcuts.
- Gradient + curve editors; flipbook texture support; ribbons/trails (if perf allows).
- Preset library (effects + materials + postprocessing) with import/export.

## Phase 5 — Export and interop
- glTF export for geometry + standard PBR textures/materials.
- MaterialX export for compatible graphs; validation + warnings for unsupported nodes.
- Native JSON export/import for full-fidelity graphs; starter Unreal/Unity importer guidance.

## Quality gates per phase
- Automated compile-time tests for material/FX graphs (Jest).
- Playwright visual smoke for default scene and top presets.
- Manual checklist: load fallback asset, upload a model, apply material preset, spawn particles, toggle performance mode.
