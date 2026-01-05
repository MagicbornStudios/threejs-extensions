import { create } from 'zustand';
import type { Edge, EdgeChange, Node, NodeChange, OnConnect } from 'reactflow';
import { addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import type { Material } from 'three';
import type { MeshPhysicalNodeMaterial } from 'three/examples/jsm/nodes/materials/MeshPhysicalNodeMaterial.js';
import { compileMaterialGraph } from '@/lib/materials/compiler';
import { createInitialGraph, toGraphSnapshot } from '@/lib/materials/schema';
import { MaterialGraphSnapshot, MaterialNodeCategory, MaterialNodeData, MaterialPortKey } from '@/lib/materials/types';

interface MaterialGraphState {
  readonly nodes: Node<MaterialNodeData>[];
  readonly edges: Edge<MaterialPortKey>[];
  readonly selectedNodeId?: string;
  readonly compiledMaterial?: MeshPhysicalNodeMaterial | Material;
  readonly diagnostics: readonly string[];
  readonly setNodes: (changes: NodeChange[]) => void;
  readonly setEdges: (changes: EdgeChange[]) => void;
  readonly connect: OnConnect;
  readonly setSelection: (nodeId?: string) => void;
  readonly updateCode: (nodeId: string, glsl: string) => void;
  readonly compile: () => void;
}

const initialGraph = createInitialGraph();

function mergeSnapshot(snapshot: MaterialGraphSnapshot) {
  return compileMaterialGraph(snapshot);
}

export const useMaterialGraphStore = create<MaterialGraphState>((set, get) => ({
  nodes: initialGraph.nodes,
  edges: initialGraph.edges,
  diagnostics: [],
  setNodes: (changes) => set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  setEdges: (changes) => set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  connect: (connection) =>
    set((state) => ({ edges: addEdge({ ...connection, type: 'smoothstep' }, state.edges) })),
  setSelection: (nodeId) => set(() => ({ selectedNodeId: nodeId })),
  updateCode: (nodeId, glsl) =>
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id !== nodeId || node.data.category !== MaterialNodeCategory.Code) {
          return node;
        }

        return {
          ...node,
          data: { ...node.data, glsl },
        };
      }),
    })),
  compile: () => {
    const snapshot = toGraphSnapshot(get().nodes, get().edges);
    const next = mergeSnapshot(snapshot);

    set((state) => {
      if (state.compiledMaterial && state.compiledMaterial !== next.material && 'dispose' in state.compiledMaterial) {
        state.compiledMaterial.dispose();
      }
      return { compiledMaterial: next.material as MeshPhysicalNodeMaterial | Material, diagnostics: next.diagnostics };
    });
  },
}));
