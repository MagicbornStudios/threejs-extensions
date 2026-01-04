export type ModelSource =
  | {
      readonly kind: 'gltf';
      readonly url: string;
      readonly label: string;
      readonly isFallback: boolean;
      readonly objectUrl?: string;
    }
  | {
      readonly kind: 'primitive';
      readonly label: string;
      readonly isFallback: true;
    };

const acceptedMimeTypes = new Set<string>([
  'model/gltf-binary',
  'model/gltf+json',
  'model/gltf+binary',
  'model/gltf',
  'application/octet-stream',
]);

const acceptedExtensions = ['.glb', '.gltf'];

export function isValidModelFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return (
    acceptedExtensions.some((ext) => lowerName.endsWith(ext)) ||
    (file.type !== '' && acceptedMimeTypes.has(file.type))
  );
}

export function createModelSourceFromFile(file: File): ModelSource | null {
  if (!isValidModelFile(file)) {
    return null;
  }

  const objectUrl = URL.createObjectURL(file);
  return {
    kind: 'gltf',
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
