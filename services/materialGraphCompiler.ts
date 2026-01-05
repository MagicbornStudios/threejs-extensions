export const MaterialNodeKind = {
  Input: 'Input',
  Operator: 'Operator',
  Output: 'Output',
} as const;

export type MaterialNodeKind = (typeof MaterialNodeKind)[keyof typeof MaterialNodeKind];

export interface MaterialGraphNode {
  readonly id: string;
  readonly label: string;
  readonly kind: MaterialNodeKind;
  readonly params?: Readonly<Record<string, number>>;
}

export interface MaterialGraphEdge {
  readonly from: string;
  readonly to: string;
}

export interface MaterialGraph {
  readonly nodes: readonly MaterialGraphNode[];
  readonly edges: readonly MaterialGraphEdge[];
}

export interface CompileDiagnostics {
  readonly messages: readonly string[];
  readonly usedFallbacks: boolean;
}

export interface CompileResult {
  readonly graph: MaterialGraph;
  readonly diagnostics: CompileDiagnostics;
  readonly orderedNodeIds: readonly string[];
}

const DEFAULT_FALLBACK_OUTPUT_LABEL = 'Fallback Output';
const DEFAULT_FALLBACK_INPUT_LABEL = 'Fallback Input';

const createFallbackNode = (id: string, label: string, kind: MaterialNodeKind): MaterialGraphNode => ({
  id,
  label,
  kind,
});

const uniqueNodeIds = (nodes: readonly MaterialGraphNode[]): Set<string> =>
  nodes.reduce((acc, node) => acc.add(node.id), new Set<string>());

const stableNodeSort = (nodes: readonly MaterialGraphNode[]): MaterialGraphNode[] =>
  [...nodes].sort((left, right) => {
    const rank: Record<MaterialNodeKind, number> = {
      [MaterialNodeKind.Input]: 0,
      [MaterialNodeKind.Operator]: 1,
      [MaterialNodeKind.Output]: 2,
    };
    const kindDelta = rank[left.kind] - rank[right.kind];
    return kindDelta !== 0 ? kindDelta : left.label.localeCompare(right.label);
  });

export function compileMaterialGraph(inputGraph: MaterialGraph): CompileResult {
  const messages: string[] = [];
  let usedFallbacks = false;

  const nodeMap = new Map<string, MaterialGraphNode>();
  inputGraph.nodes.forEach((node) => nodeMap.set(node.id, node));

  if (!inputGraph.nodes.some((node) => node.kind === MaterialNodeKind.Output)) {
    const fallback = createFallbackNode('output-fallback', DEFAULT_FALLBACK_OUTPUT_LABEL, MaterialNodeKind.Output);
    nodeMap.set(fallback.id, fallback);
    messages.push('Inserted fallback output node.');
    usedFallbacks = true;
  }

  if (!inputGraph.nodes.some((node) => node.kind === MaterialNodeKind.Input)) {
    const fallback = createFallbackNode('input-fallback', DEFAULT_FALLBACK_INPUT_LABEL, MaterialNodeKind.Input);
    nodeMap.set(fallback.id, fallback);
    messages.push('Inserted fallback input node.');
    usedFallbacks = true;
  }

  const existingNodes = Array.from(nodeMap.values());
  const validIds = uniqueNodeIds(existingNodes);

  const filteredEdges = inputGraph.edges.filter((edge) => validIds.has(edge.from) && validIds.has(edge.to));
  const diagnostics: CompileDiagnostics = { messages, usedFallbacks };

  const orderedNodeIds = stableNodeSort(existingNodes).map((node) => node.id);

  return {
    graph: {
      nodes: existingNodes,
      edges: filteredEdges,
    },
    diagnostics,
    orderedNodeIds,
  };
}
