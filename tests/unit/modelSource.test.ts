import { createFallbackModelSource, createModelSourceFromFile, isValidModelFile, releaseModelSource } from '@/services/modelSource';

describe('modelSource', () => {
  const originalCreateObjectUrl = global.URL.createObjectURL;
  const originalRevokeObjectUrl = global.URL.revokeObjectURL;

  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:http://example.com/mock') as typeof URL.createObjectURL;
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    global.URL.createObjectURL = originalCreateObjectUrl;
    global.URL.revokeObjectURL = originalRevokeObjectUrl;
  });

  it('accepts GLB files by extension when mime type is missing', () => {
    const file = new File(['data'], 'sample.glb', { type: '' });
    expect(isValidModelFile(file)).toBe(true);
  });

  it('rejects unsupported files', () => {
    const file = new File(['data'], 'notes.txt', { type: 'text/plain' });
    expect(isValidModelFile(file)).toBe(false);
  });

  it('creates a model source from a valid file and releases resources', () => {
    const file = new File(['data'], 'asset.glb', { type: 'model/gltf-binary' });

    const source = createModelSourceFromFile(file);
    expect(source).not.toBeNull();
    expect(source?.isFallback).toBe(false);
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);

    if (source) {
      releaseModelSource(source);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(source.objectUrl);
    }
  });

  it('falls back to the procedural model when requested', () => {
    const fallback = createFallbackModelSource();
    expect(fallback).toMatchInlineSnapshot(`
      {
        "isFallback": true,
        "kind": "primitive",
        "label": "Procedural Fallback",
      }
    `);
  });
});
