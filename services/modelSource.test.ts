import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  ACCEPTED_EXTENSIONS,
  createFallbackModelSource,
  createModelSourceFromFile,
  isValidModelFile,
  releaseModelSource,
} from './modelSource';

type MutableURL = typeof URL & {
  createObjectURL?: (input: Blob | MediaSource) => string;
  revokeObjectURL?: (url: string) => void;
};

const TEST_OBJECT_URL = 'blob:mock-object-url';
const mutableUrl = URL as MutableURL;
const originalCreateObjectURL = mutableUrl.createObjectURL;
const originalRevokeObjectURL = mutableUrl.revokeObjectURL;

let createObjectURLSpy: ReturnType<typeof vi.fn>;
let revokeObjectURLSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  createObjectURLSpy = vi.fn(() => TEST_OBJECT_URL);
  revokeObjectURLSpy = vi.fn();
  mutableUrl.createObjectURL = createObjectURLSpy;
  mutableUrl.revokeObjectURL = revokeObjectURLSpy;
});

afterEach(() => {
  mutableUrl.createObjectURL = originalCreateObjectURL;
  mutableUrl.revokeObjectURL = originalRevokeObjectURL;
  vi.restoreAllMocks();
});

describe('modelSource creation and release', () => {
  test('recognizes FBX uploads by extension and MIME type', () => {
    const fbxFile = new File(['dummy data'], 'fixture.fbx', { type: 'application/vnd.autodesk.fbx' });
    const source = createModelSourceFromFile(fbxFile);

    expect(source?.kind).toBe('fbx');
    expect(isValidModelFile(fbxFile)).toBe(true);
    expect(ACCEPTED_EXTENSIONS).toContain('.fbx');
  });

  test('revokes object URLs when releasing model sources', () => {
    const gltfFile = new File(['binary gltf'], 'fixture.glb', { type: 'model/gltf-binary' });
    const source = createModelSourceFromFile(gltfFile);

    expect(source?.objectUrl).toBe(TEST_OBJECT_URL);

    if (source) {
      releaseModelSource(source);
    }

    expect(revokeObjectURLSpy).toHaveBeenCalledWith(TEST_OBJECT_URL);
  });

  test('skips revocation for procedural fallback sources', () => {
    const fallback = createFallbackModelSource();

    releaseModelSource(fallback);

    expect(revokeObjectURLSpy).not.toHaveBeenCalled();
  });

  test('returns null for unsupported files so the UI can fall back', () => {
    const invalidFile = new File(['notes'], 'readme.txt', { type: 'text/plain' });

    expect(createModelSourceFromFile(invalidFile)).toBeNull();
  });
});
