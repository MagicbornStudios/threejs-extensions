'use client';

import { Background, Controls, ReactFlow, type Connection, type EdgeChange, type NodeChange } from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback } from 'react';
import { nodeTypes } from './ShaderNode';
import { useMaterialGraphStore } from '@/stores/materialGraph';

export function ShaderGraph() {
  const nodes = useMaterialGraphStore((state) => state.nodes);
  const edges = useMaterialGraphStore((state) => state.edges);
  const setNodes = useMaterialGraphStore((state) => state.setNodes);
  const setEdges = useMaterialGraphStore((state) => state.setEdges);
  const connect = useMaterialGraphStore((state) => state.connect);
  const setSelection = useMaterialGraphStore((state) => state.setSelection);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes(changes), [setNodes]);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges(changes), [setEdges]);
  const onConnect = useCallback((connection: Connection) => connect(connection), [connect]);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: { id: string }[] }) => {
      setSelection(selectedNodes[0]?.id);
    },
    [setSelection],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      className="shader-graph"
      onSelectionChange={onSelectionChange}
      minZoom={0.2}
      maxZoom={1.6}
      defaultEdgeOptions={{ type: 'smoothstep' }}
    >
      <Background gap={20} color="#1f2937" />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}
