'use client';

import dynamic from 'next/dynamic';
import { useCallback, useMemo } from 'react';
import { MaterialNodeCategory } from '@/lib/materials/types';
import { useMaterialGraphStore } from '@/stores/materialGraph';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export function ShaderCodePane() {
  const selectedNodeId = useMaterialGraphStore((state) => state.selectedNodeId);
  const nodes = useMaterialGraphStore((state) => state.nodes);
  const updateCode = useMaterialGraphStore((state) => state.updateCode);

  const codeNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId && node.data.category === MaterialNodeCategory.Code), [nodes, selectedNodeId]);

  const handleChange = useCallback(
    (value?: string) => {
      if (!codeNode) {
        return;
      }
      updateCode(codeNode.id, value ?? '');
    },
    [codeNode, updateCode],
  );

  if (!codeNode) {
    return (
      <div className="code-pane__empty">
        <p>Select a CodeNode to edit inline GLSL. Inputs default to primary and secondary sockets.</p>
      </div>
    );
  }

  return (
    <div className="code-pane">
      <div className="code-pane__header">
        <div>
          <div className="code-pane__label">Inline GLSL</div>
          <div className="code-pane__title">{codeNode.data.title}</div>
        </div>
      </div>
      <MonacoEditor
        height="220px"
        defaultLanguage="glsl"
        value={codeNode.data.glsl}
        theme="vs-dark"
        onChange={handleChange}
        options={{ minimap: { enabled: false }, fontSize: 13 }}
      />
    </div>
  );
}
