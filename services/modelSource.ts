type HostedModelKind = 'gltf' | 'fbx';

export type ModelSource =
  | {
      readonly kind: HostedModelKind;
      readonly url: string;
      readonly label: string;
      readonly isFallback: false;
      readonly objectUrl?: string;
    }
  | {
      readonly kind: 'primitive';
      readonly label: string;
      readonly isFallback: true;
    };

const gltfMimeTypes = new Set<string>([
  'model/gltf-binary',
  'model/gltf+json',
  'model/gltf+binary',
  'model/gltf',
]);

const fbxMimeTypes = new Set<string>([
  'application/fbx',
  'application/vnd.autodesk.fbx',
  'application/x-autodesk-fbx',
  'application/x-fbx',
  'application/octet-stream',
]);

export const ACCEPTED_EXTENSIONS: readonly string[] = ['.glb', '.gltf', '.fbx'];

function resolveModelKind(file: File): HostedModelKind | null {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith('.fbx')) {
    return 'fbx';
  }

  if (lowerName.endsWith('.glb') || lowerName.endsWith('.gltf')) {
    return 'gltf';
  }

  if (file.type !== '') {
    if (gltfMimeTypes.has(file.type)) {
      return 'gltf';
    }

    if (fbxMimeTypes.has(file.type)) {
      return 'fbx';
    }
  }

  return null;
}

export function isValidModelFile(file: File): boolean {
  return resolveModelKind(file) !== null;
}

export function createModelSourceFromFile(file: File): ModelSource | null {
  const kind = resolveModelKind(file);
  if (!kind) {
    return null;
  }

  const objectUrl = URL.createObjectURL(file);
  return {
    kind,
    url: objectUrl,
    objectUrl,
    label: file.name,
    isFallback: false,
  };
}

export function createFallbackModelSource(): ModelSource {
  return {
    kind: 'primitive',
    label: 'Procedural Fallback',
    isFallback: true,
  };
}

export function releaseModelSource(source: ModelSource): void {
  if ('objectUrl' in source && source.objectUrl) {
    URL.revokeObjectURL(source.objectUrl);
  }
}
