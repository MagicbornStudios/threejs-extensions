# Agent Guidelines for `threejs-extensions`

These rules apply to the entire repository unless a deeper directory adds more specific instructions.

## Architectural expectations
- Favor **Next.js (App Router) + React Three Fiber** with client-side rendering; the app must boot immediately with a fallback scene and **must not require authentication**.
- Keep the codebase **modular and service-driven**: isolate domain **models** (types/schemas), **services** (API-like modules used directly by the UI), and **view components**. Cross-cutting utilities should live in `lib/` or a clearly named helper module.
- Editor interactions (materials, FX, uploads) should call services as if they were an API. Services should be composable, side-effect-light, and injectable for testing.

## Coding standards
- Use **TypeScript** with explicit types; prefer interfaces/types over `any`.
- **Avoid raw string literals** in code unless absolutely required (e.g., user-facing labels, shader chunks). Prefer enums, string literal unions, or shared constants for identifiers and configuration keys.
- Keep functions small and pure where practical. Separate mutation (state/services) from rendering (components).
- Prefer dependency injection or parameterized factories over singletons; keep services stateless when possible.
- Maintain clear module boundaries: UI ↔ services ↔ models. Avoid importing from deep internals; expose public APIs via index files.

## UX/runtime guarantees
- The editor must remain **usable without login** and ship with safe fallbacks for models, environments, and shaders so the scene always renders.
- Degrade gracefully: feature-flag experimental paths and ensure defaults keep the app running.

## Testing and quality
- Add unit tests for service modules and compilers when touching logic; keep docs updated alongside behavior changes.
- Follow repository documentation conventions when adding new guides or references.

When in doubt, favor maintainability, explicitness, and composability.
