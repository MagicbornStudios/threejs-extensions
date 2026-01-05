import { Color, DoubleSide, MeshPhysicalMaterial } from 'three';
import {
  abs,
  add,
  clamp,
  float,
  glslFn,
  MeshPhysicalNodeMaterial,
  mix,
  mul,
  normalize,
  normalWorld,
  positionWorld,
  sub,
  sin,
  smoothstep,
  timerLocal,
  uv,
  vec2,
  vec3,
} from 'three/examples/jsm/nodes/Nodes.js';
import { cameraPosition } from 'three/examples/jsm/nodes/accessors/CameraNode.js';
import {
  InputNodeType,
  MaterialGraphSnapshot,
  MaterialNodeCategory,
  MaterialNodeData,
  InputNodeData,
  CodeNodeData,
  MathNodeData,
  MathNodeType,
  OutputNodeType,
  SocketType,
  MATERIAL_PORT_KEYS,
  MaterialPortKey,
  CompileResult,
} from './types';
import { defaultValueForSocket, getPortsForNode } from './schema';

const BASE_COLOR_DEFAULT = new Color('#c7cad4');
const EMISSIVE_DEFAULT = new Color('#0d0f13');

interface ResolutionContext {
  readonly cache: Map<string, any>;
  readonly edges: MaterialGraphSnapshot['edges'];
  readonly nodes: Map<string, MaterialNodeData>;
  readonly diagnostics: string[];
}

function literalForSocket(value: number | [number, number] | [number, number, number], socketType: SocketType) {
  if (socketType === SocketType.Vec2 && Array.isArray(value) && value.length === 2) {
    return vec2(value[0], value[1]);
  }

  if ((socketType === SocketType.Vec3 || socketType === SocketType.Color) && Array.isArray(value) && value.length === 3) {
    return vec3(value[0], value[1], value[2]);
  }

  if (socketType === SocketType.Vec3 || socketType === SocketType.Color) {
    return vec3(value as number, value as number, value as number);
  }

  return float(value as number);
}

function resolveEdge(context: ResolutionContext, nodeId: string, handle: MaterialPortKey) {
  const match = context.edges.find((edge) => edge.target === nodeId && edge.targetHandle === handle);
  if (!match) {
    return undefined;
  }

  return context.cache.get(`${match.source}:${match.sourceHandle}`) ?? resolveNodeOutput(context, match.source, match.sourceHandle);
}

function resolveNodeOutput(context: ResolutionContext, nodeId: string, handle: MaterialPortKey) {
  const cacheKey = `${nodeId}:${handle}`;
  if (context.cache.has(cacheKey)) {
    return context.cache.get(cacheKey);
  }

  const node = context.nodes.get(nodeId);
  if (!node) {
    return undefined;
  }

  let result: any;

  if (node.category === MaterialNodeCategory.Input) {
    result = resolveInputNode(node, handle);
  } else if (node.category === MaterialNodeCategory.Math) {
    result = resolveMathNode(context, node, handle);
  } else if (node.category === MaterialNodeCategory.Code) {
    result = resolveCodeNode(context, node);
  }

  context.cache.set(cacheKey, result);
  return result;
}

function resolveInputNode(node: InputNodeData, handle: MaterialPortKey) {
  if (handle !== MATERIAL_PORT_KEYS.out) {
    return undefined;
  }

  switch (node.type) {
    case InputNodeType.Float:
      return float((node.value as number | undefined) ?? 1);
    case InputNodeType.Vec2: {
      const value = node.value as [number, number] | undefined;
      const resolved: [number, number] = value ?? [0, 0];
      return vec2(resolved[0], resolved[1]);
    }
    case InputNodeType.Vec3: {
      const value = (node.value as [number, number, number] | undefined) ?? [0.5, 0.5, 0.5];
      return vec3(value[0], value[1], value[2]);
    }
    case InputNodeType.Color: {
      const color = new Color(node.color ?? BASE_COLOR_DEFAULT);
      return vec3(color.r, color.g, color.b);
    }
    case InputNodeType.Time:
      return timerLocal();
    case InputNodeType.UV:
      return uv();
    case InputNodeType.NormalWorld:
      return normalWorld;
    case InputNodeType.PositionWorld:
      return positionWorld;
    case InputNodeType.ViewDirection:
      return normalize(sub(cameraPosition, positionWorld));
    default:
      return float(1);
  }
}

function resolveMathNode(context: ResolutionContext, node: MathNodeData, handle: MaterialPortKey) {
  if (handle !== MATERIAL_PORT_KEYS.out) {
    return undefined;
  }

  const ports = getPortsForNode(node);
  const resolvedInputs = new Map<MaterialPortKey, any>();

  for (const port of ports.inputs) {
    const value = resolveEdge(context, node.id, port.key);
    if (value) {
      resolvedInputs.set(port.key, value);
    }
  }

  const resolveOrDefault = (key: MaterialPortKey, socketType: SocketType) =>
    resolvedInputs.get(key) ?? literalForSocket(defaultValueForSocket(socketType), socketType);

  switch (node.type) {
    case MathNodeType.Add:
      return add(resolveOrDefault(MATERIAL_PORT_KEYS.primary, SocketType.Vec3), resolveOrDefault(MATERIAL_PORT_KEYS.secondary, SocketType.Vec3));
    case MathNodeType.Multiply:
      return mul(resolveOrDefault(MATERIAL_PORT_KEYS.primary, SocketType.Float), resolveOrDefault(MATERIAL_PORT_KEYS.secondary, SocketType.Float));
    case MathNodeType.Lerp:
      return mix(
        resolveOrDefault(MATERIAL_PORT_KEYS.primary, SocketType.Vec3),
        resolveOrDefault(MATERIAL_PORT_KEYS.secondary, SocketType.Vec3),
        resolveOrDefault(MATERIAL_PORT_KEYS.factor, SocketType.Float),
      );
    case MathNodeType.Clamp:
      return clamp(
        resolveOrDefault(MATERIAL_PORT_KEYS.input, SocketType.Float),
        resolveOrDefault(MATERIAL_PORT_KEYS.min, SocketType.Float),
        resolveOrDefault(MATERIAL_PORT_KEYS.max, SocketType.Float),
      );
    case MathNodeType.Pow:
      return resolveOrDefault(MATERIAL_PORT_KEYS.primary, SocketType.Float).pow(
        resolveOrDefault(MATERIAL_PORT_KEYS.secondary, SocketType.Float),
      );
    case MathNodeType.Smoothstep:
      return smoothstep(
        resolveOrDefault(MATERIAL_PORT_KEYS.min, SocketType.Float),
        resolveOrDefault(MATERIAL_PORT_KEYS.max, SocketType.Float),
        resolveOrDefault(MATERIAL_PORT_KEYS.input, SocketType.Float),
      );
    case MathNodeType.Sine:
      return sin(resolveOrDefault(MATERIAL_PORT_KEYS.input, SocketType.Float));
    case MathNodeType.Abs:
      return abs(resolveOrDefault(MATERIAL_PORT_KEYS.input, SocketType.Float));
    default:
      return float(1);
  }
}

function resolveCodeNode(context: ResolutionContext, node: CodeNodeData) {
  const primaryInput = (resolveEdge(context, node.id, MATERIAL_PORT_KEYS.primary) ?? vec3(1, 0.8, 0.6)) as any;
  const secondaryInput = (resolveEdge(context, node.id, MATERIAL_PORT_KEYS.secondary) ?? vec3(0.4, 0.5, 0.8)) as any;

  const shadeFunction = glslFn(
    `vec3 shadeNode(vec3 primary, vec3 secondary, vec2 uv) {\n${node.glsl}\n}`,
  );
  const shadeResult = shadeFunction(primaryInput, secondaryInput, uv());

  return mix(primaryInput, secondaryInput, shadeResult);
}

function resolveOutputNode(
  context: ResolutionContext,
  nodeType: OutputNodeType,
  socketType: SocketType,
  fallback: number | [number, number, number],
) {
  const targetNode = Array.from(context.nodes.values()).find(
    (candidate) => candidate.category === MaterialNodeCategory.Output && candidate.type === nodeType,
  );

  if (!targetNode) {
    return literalForSocket(fallback, socketType);
  }

  const incoming = resolveEdge(context, targetNode.id, MATERIAL_PORT_KEYS.input);
  if (!incoming) {
    context.diagnostics.push(`Missing input for ${targetNode.title ?? nodeType}`);
    return literalForSocket(fallback, socketType);
  }

  return incoming;
}

export function compileMaterialGraph(graph: MaterialGraphSnapshot): CompileResult {
  try {
    const diagnostics: string[] = [];
    const context: ResolutionContext = {
      cache: new Map(),
      edges: graph.edges,
      nodes: new Map(graph.nodes.map((node) => [node.id, node])),
      diagnostics,
    };

    const baseColorNode = resolveOutputNode(context, OutputNodeType.BaseColor, SocketType.Color, [BASE_COLOR_DEFAULT.r, BASE_COLOR_DEFAULT.g, BASE_COLOR_DEFAULT.b]);
    const emissiveNode = resolveOutputNode(context, OutputNodeType.Emissive, SocketType.Color, [EMISSIVE_DEFAULT.r, EMISSIVE_DEFAULT.g, EMISSIVE_DEFAULT.b]);
    const roughnessNode = resolveOutputNode(context, OutputNodeType.Roughness, SocketType.Float, 0.55);
    const metalnessNode = resolveOutputNode(context, OutputNodeType.Metalness, SocketType.Float, 0.08);
    const opacityNode = resolveOutputNode(context, OutputNodeType.Opacity, SocketType.Float, 1.0);
    const normalNode = resolveOutputNode(context, OutputNodeType.Normal, SocketType.Vec3, [0, 0, 1]);

    const material = new MeshPhysicalNodeMaterial();
    material.side = DoubleSide;
    material.colorNode = baseColorNode;
    material.emissiveNode = emissiveNode;
    material.roughnessNode = roughnessNode;
    material.metalnessNode = metalnessNode;
    material.opacityNode = opacityNode;
    material.normalNode = normalNode;
    material.transparent = true;
    material.needsUpdate = true;

    return { material, diagnostics };
  } catch (error) {
    const fallback = new MeshPhysicalMaterial({ color: BASE_COLOR_DEFAULT, roughness: 0.6, metalness: 0.1 });
    fallback.side = DoubleSide;
    return { material: fallback, diagnostics: ['Failed to compile material graph'] };
  }
}
