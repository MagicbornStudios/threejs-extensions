'use client';

import { useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { ShaderGraph } from './ShaderGraph';
import { ShaderCodePane } from './ShaderCodePane';
import { useMaterialGraphStore } from '@/stores/materialGraph';

export function ShaderEditor() {
  const nodes = useMaterialGraphStore((state) => state.nodes);
  const edges = useMaterialGraphStore((state) => state.edges);
  const compile = useMaterialGraphStore((state) => state.compile);
  const diagnostics = useMaterialGraphStore((state) => state.diagnostics);

  useEffect(() => {
    compile();
  }, [compile, nodes, edges]);

  return (
    <ReactFlowProvider>
      <div className="shader-editor">
        <div className="shader-editor__graph">
          <ShaderGraph />
        </div>
        <div className="shader-editor__code">
          <ShaderCodePane />
          <div className="shader-editor__diagnostics">
            <div className="shader-editor__label">Compiler feedback</div>
            {diagnostics.length === 0 ? (
              <div className="shader-editor__diagnostic">Graph compiled successfully.</div>
            ) : (
              diagnostics.map((entry) => (
                <div key={entry} className="shader-editor__diagnostic shader-editor__diagnostic--warning">
                  {entry}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
