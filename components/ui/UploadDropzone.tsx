'use client';

import { useDropzone } from 'react-dropzone';
import { useMemo } from 'react';

interface UploadDropzoneProps {
  readonly onFileAccepted: (file: File) => void;
  readonly onReject: () => void;
  readonly acceptedExtensions: readonly string[];
}

export function UploadDropzone({ onFileAccepted, onReject, acceptedExtensions }: UploadDropzoneProps) {
  const accept = useMemo(
    () => ({
      'model/gltf-binary': acceptedExtensions,
      'model/gltf+binary': acceptedExtensions,
      'model/gltf+json': acceptedExtensions,
      'model/gltf': acceptedExtensions,
      'application/octet-stream': acceptedExtensions,
      'application/fbx': acceptedExtensions,
      'application/vnd.autodesk.fbx': acceptedExtensions,
      'application/x-autodesk-fbx': acceptedExtensions,
      'application/x-fbx': acceptedExtensions,
    }),
    [acceptedExtensions],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles: 1,
    multiple: false,
    onDropAccepted: (files) => {
      const [first] = files;
      if (first) {
        onFileAccepted(first);
      }
    },
    onDropRejected: onReject,
    noKeyboard: true,
  });

  return (
    <div className={`dropzone ${isDragActive ? 'is-active' : ''}`} {...getRootProps()}>
      <input {...getInputProps()} />
      <h3>Drop a GLB, GLTF, or FBX file</h3>
      <p>Drag a model here or click to browse. The viewer will fall back to the default asset on failure.</p>
    </div>
  );
}
