import type { Edge, Node } from 'reactflow';
import {
  InputNodeType,
  MaterialGraphEdge,
  MaterialNodeCategory,
  MaterialNodeData,
  MaterialPortKey,
  MaterialGraphSnapshot,
  MathNodeType,
  OutputNodeType,
  PortDefinition,
  SocketType,
  MATERIAL_PORT_KEYS,
} from './types';

export interface GraphTemplate {
  readonly nodes: Node<MaterialNodeData>[];
  readonly edges: Edge<MaterialPortKey>[];
}

let edgeCounter = 0;

function createEdgeId(): string {
  edgeCounter += 1;
  return `edge-${edgeCounter}`;
}

const baseHandle: PortDefinition = { key: MATERIAL_PORT_KEYS.out, label: 'Out', socketType: SocketType.Float };

const portSets: Record<MathNodeType, { inputs: PortDefinition[]; output: PortDefinition }> = {
  [MathNodeType.Add]: {
    inputs: [
      { key: MATERIAL_PORT_KEYS.primary, label: 'A', socketType: SocketType.Vec3 },
      { key: MATERIAL_PORT_KEYS.secondary, label: 'B', socketType: SocketType.Vec3 },
    ],
    output: { ...baseHandle, socketType: SocketType.Vec3 },
  },
  [MathNodeType.Multiply]: {
    inputs: [
      { key: MATERIAL_PORT_KEYS.primary, label: 'A', socketType: SocketType.Float },
      { key: MATERIAL_PORT_KEYS.secondary, label: 'B', socketType: SocketType.Float },
    ],
    output: baseHandle,
  },
  [MathNodeType.Lerp]: {
    inputs: [
      { key: MATERIAL_PORT_KEYS.primary, label: 'A', socketType: SocketType.Vec3 },
      { key: MATERIAL_PORT_KEYS.secondary, label: 'B', socketType: SocketType.Vec3 },
      { key: MATERIAL_PORT_KEYS.factor, label: 'T', socketType: SocketType.Float },
    ],
    output: { ...baseHandle, socketType: SocketType.Vec3 },
  },
  [MathNodeType.Clamp]: {
    inputs: [
      { key: MATERIAL_PORT_KEYS.input, label: 'Value', socketType: SocketType.Float },
      { key: MATERIAL_PORT_KEYS.min, label: 'Min', socketType: SocketType.Float },
      { key: MATERIAL_PORT_KEYS.max, label: 'Max', socketType: SocketType.Float },
    ],
    output: baseHandle,
  },
  [MathNodeType.Pow]: {
    inputs: [
      { key: MATERIAL_PORT_KEYS.primary, label: 'Base', socketType: SocketType.Float },
      { key: MATERIAL_PORT_KEYS.secondary, label: 'Power', socketType: SocketType.Float },
    ],
    output: baseHandle,
  },
  [MathNodeType.Smoothstep]: {
    inputs: [
      { key: MATERIAL_PORT_KEYS.min, label: 'Edge 0', socketType: SocketType.Float },
      { key: MATERIAL_PORT_KEYS.max, label: 'Edge 1', socketType: SocketType.Float },
      { key: MATERIAL_PORT_KEYS.input, label: 'Value', socketType: SocketType.Float },
    ],
    output: baseHandle,
  },
  [MathNodeType.Sine]: {
    inputs: [{ key: MATERIAL_PORT_KEYS.input, label: 'Radians', socketType: SocketType.Float }],
    output: baseHandle,
  },
  [MathNodeType.Abs]: {
    inputs: [{ key: MATERIAL_PORT_KEYS.input, label: 'Value', socketType: SocketType.Float }],
    output: baseHandle,
  },
};

const outputPorts: Record<OutputNodeType, PortDefinition> = {
  [OutputNodeType.BaseColor]: { key: MATERIAL_PORT_KEYS.input, label: 'Color', socketType: SocketType.Color },
  [OutputNodeType.Emissive]: { key: MATERIAL_PORT_KEYS.input, label: 'Emissive', socketType: SocketType.Color },
  [OutputNodeType.Roughness]: { key: MATERIAL_PORT_KEYS.input, label: 'Roughness', socketType: SocketType.Float },
  [OutputNodeType.Metalness]: { key: MATERIAL_PORT_KEYS.input, label: 'Metalness', socketType: SocketType.Float },
  [OutputNodeType.Normal]: { key: MATERIAL_PORT_KEYS.input, label: 'Normal', socketType: SocketType.Vec3 },
  [OutputNodeType.Opacity]: { key: MATERIAL_PORT_KEYS.input, label: 'Opacity', socketType: SocketType.Float },
};

export function getPortsForNode(node: MaterialNodeData): { inputs: PortDefinition[]; outputs: PortDefinition[] } {
  if (node.category === MaterialNodeCategory.Input) {
    const outputType = mapInputSocket(node.type);
    return { inputs: [], outputs: [{ key: MATERIAL_PORT_KEYS.out, label: 'Out', socketType: outputType }] };
  }

  if (node.category === MaterialNodeCategory.Math) {
    const math = portSets[node.type];
    return { inputs: math.inputs, outputs: [math.output] };
  }

  if (node.category === MaterialNodeCategory.Output) {
    const handle = outputPorts[node.type];
    return { inputs: [handle], outputs: [] };
  }

  return {
    inputs: [
      { key: MATERIAL_PORT_KEYS.primary, label: 'Primary', socketType: SocketType.Vec3 },
      { key: MATERIAL_PORT_KEYS.secondary, label: 'Secondary', socketType: SocketType.Vec3 },
    ],
    outputs: [{ key: MATERIAL_PORT_KEYS.out, label: 'Out', socketType: node.outputType }],
  };
}

export function mapInputSocket(inputType: InputNodeType): SocketType {
  switch (inputType) {
    case InputNodeType.Float:
    case InputNodeType.Time:
      return SocketType.Float;
    case InputNodeType.Vec2:
    case InputNodeType.UV:
      return SocketType.Vec2;
    case InputNodeType.Vec3:
    case InputNodeType.NormalWorld:
    case InputNodeType.PositionWorld:
    case InputNodeType.ViewDirection:
      return SocketType.Vec3;
    case InputNodeType.Color:
      return SocketType.Color;
    default:
      return SocketType.Float;
  }
}

export function defaultValueForSocket(socketType: SocketType): number | [number, number] | [number, number, number] {
  if (socketType === SocketType.Vec2) {
    return [0, 0];
  }
  if (socketType === SocketType.Vec3 || socketType === SocketType.Color) {
    return [0.8, 0.82, 0.88];
  }
  return 1;
}

export function createInitialGraph(): GraphTemplate {
  const nodes: Node<MaterialNodeData>[] = [
    {
      id: 'input-color',
      type: 'material',
      position: { x: 80, y: 80 },
      data: {
        id: 'input-color',
        title: 'Base Color',
        category: MaterialNodeCategory.Input,
        type: InputNodeType.Color,
        color: '#7dd3fc',
      },
    },
    {
      id: 'input-time',
      type: 'material',
      position: { x: 80, y: 260 },
      data: {
        id: 'input-time',
        title: 'Time',
        category: MaterialNodeCategory.Input,
        type: InputNodeType.Time,
      },
    },
    {
      id: 'wave-sine',
      type: 'material',
      position: { x: 320, y: 260 },
      data: {
        id: 'wave-sine',
        title: 'Sine Wave',
        category: MaterialNodeCategory.Math,
        type: MathNodeType.Sine,
      },
    },
    {
      id: 'lerp-hue',
      type: 'material',
      position: { x: 560, y: 160 },
      data: {
        id: 'lerp-hue',
        title: 'Blend',
        category: MaterialNodeCategory.Math,
        type: MathNodeType.Lerp,
      },
    },
    {
      id: 'code-fragment',
      type: 'material',
      position: { x: 320, y: 40 },
      data: {
        id: 'code-fragment',
        title: 'CodeNode',
        category: MaterialNodeCategory.Code,
        glsl: 'vec3 tint = normalize(primary + vec3(0.2, 0.1, 0.0));\nreturn vec3(tint * 0.9);',
        outputType: SocketType.Vec3,
      },
    },
    {
      id: 'output-base',
      type: 'material',
      position: { x: 840, y: 120 },
      data: {
        id: 'output-base',
        title: 'Base Color',
        category: MaterialNodeCategory.Output,
        type: OutputNodeType.BaseColor,
      },
    },
    {
      id: 'output-emissive',
      type: 'material',
      position: { x: 840, y: 240 },
      data: {
        id: 'output-emissive',
        title: 'Emissive',
        category: MaterialNodeCategory.Output,
        type: OutputNodeType.Emissive,
      },
    },
  ];

  const edges: Edge<MaterialPortKey>[] = [
    {
      id: createEdgeId(),
      source: 'input-time',
      target: 'wave-sine',
      sourceHandle: MATERIAL_PORT_KEYS.out,
      targetHandle: MATERIAL_PORT_KEYS.input,
      type: 'smoothstep',
    },
    {
      id: createEdgeId(),
      source: 'wave-sine',
      target: 'lerp-hue',
      sourceHandle: MATERIAL_PORT_KEYS.out,
      targetHandle: MATERIAL_PORT_KEYS.factor,
      type: 'smoothstep',
    },
    {
      id: createEdgeId(),
      source: 'input-color',
      target: 'lerp-hue',
      sourceHandle: MATERIAL_PORT_KEYS.out,
      targetHandle: MATERIAL_PORT_KEYS.primary,
      type: 'smoothstep',
    },
    {
      id: createEdgeId(),
      source: 'code-fragment',
      target: 'lerp-hue',
      sourceHandle: MATERIAL_PORT_KEYS.out,
      targetHandle: MATERIAL_PORT_KEYS.secondary,
      type: 'smoothstep',
    },
    {
      id: createEdgeId(),
      source: 'lerp-hue',
      target: 'output-base',
      sourceHandle: MATERIAL_PORT_KEYS.out,
      targetHandle: MATERIAL_PORT_KEYS.input,
      type: 'smoothstep',
    },
    {
      id: createEdgeId(),
      source: 'wave-sine',
      target: 'output-emissive',
      sourceHandle: MATERIAL_PORT_KEYS.out,
      targetHandle: MATERIAL_PORT_KEYS.input,
      type: 'smoothstep',
    },
  ];

  return { nodes, edges };
}

export function toGraphSnapshot(nodes: Node<MaterialNodeData>[], edges: Edge<MaterialPortKey>[]): MaterialGraphSnapshot {
  const safeEdges: MaterialGraphEdge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? MATERIAL_PORT_KEYS.out,
    targetHandle: edge.targetHandle ?? MATERIAL_PORT_KEYS.input,
  }));

  return {
    nodes: nodes.map((node) => node.data),
    edges: safeEdges,
  };
}
