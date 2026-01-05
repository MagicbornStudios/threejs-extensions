import { compileMaterialGraph, MaterialNodeKind, type MaterialGraph } from '@/services/materialGraphCompiler';

describe('materialGraphCompiler', () => {
  it('inserts fallback nodes and orders the graph predictably', () => {
    const graph: MaterialGraph = {
      nodes: [
        { id: 'op-1', label: 'Multiply', kind: MaterialNodeKind.Operator },
      ],
      edges: [],
    };

    const result = compileMaterialGraph(graph);

    expect(result.orderedNodeIds).toEqual(['input-fallback', 'op-1', 'output-fallback']);
    expect(result.diagnostics).toEqual({
      messages: ['Inserted fallback output node.', 'Inserted fallback input node.'],
      usedFallbacks: true,
    });
    expect(result.graph.nodes).toHaveLength(3);
  });

  it('filters out edges that target missing nodes while keeping valid ones', () => {
    const graph: MaterialGraph = {
      nodes: [
        { id: 'input-1', label: 'Albedo', kind: MaterialNodeKind.Input },
        { id: 'op-1', label: 'Combine', kind: MaterialNodeKind.Operator },
        { id: 'output-1', label: 'Surface', kind: MaterialNodeKind.Output },
      ],
      edges: [
        { from: 'input-1', to: 'op-1' },
        { from: 'ghost', to: 'output-1' },
      ],
    };

    const result = compileMaterialGraph(graph);

    expect(result.graph.edges).toEqual([{ from: 'input-1', to: 'op-1' }]);
    expect(result.diagnostics.usedFallbacks).toBe(false);
  });
});
