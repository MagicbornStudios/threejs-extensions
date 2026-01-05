export enum MaterialNodeCategory {
  Input = 'input',
  Math = 'math',
  Output = 'output',
  Code = 'code',
}

export enum InputNodeType {
  Float = 'float',
  Vec2 = 'vec2',
  Vec3 = 'vec3',
  Color = 'color',
  Time = 'time',
  UV = 'uv',
  NormalWorld = 'normalWorld',
  PositionWorld = 'positionWorld',
  ViewDirection = 'viewDirection',
}

export enum MathNodeType {
  Add = 'add',
  Multiply = 'multiply',
  Lerp = 'lerp',
  Clamp = 'clamp',
  Pow = 'pow',
  Smoothstep = 'smoothstep',
  Sine = 'sine',
  Abs = 'abs',
}

export enum OutputNodeType {
  BaseColor = 'baseColor',
  Emissive = 'emissive',
  Roughness = 'roughness',
  Metalness = 'metalness',
  Normal = 'normal',
  Opacity = 'opacity',
}

export enum SocketType {
  Float = 'float',
  Vec2 = 'vec2',
  Vec3 = 'vec3',
  Color = 'color',
}

export const MATERIAL_PORT_KEYS = {
  primary: 'primary',
  secondary: 'secondary',
  factor: 'factor',
  min: 'min',
  max: 'max',
  input: 'input',
  uv: 'uv',
  direction: 'direction',
  out: 'out',
} as const;

export type MaterialPortKey = (typeof MATERIAL_PORT_KEYS)[keyof typeof MATERIAL_PORT_KEYS];

export interface PortDefinition {
  readonly key: MaterialPortKey;
  readonly label: string;
  readonly socketType: SocketType;
}

export interface BaseNodeData {
  readonly id: string;
  readonly title: string;
  readonly category: MaterialNodeCategory;
  readonly label?: string;
}

export interface InputNodeData extends BaseNodeData {
  readonly category: MaterialNodeCategory.Input;
  readonly type: InputNodeType;
  readonly value?: number | [number, number] | [number, number, number];
  readonly color?: string;
}

export interface MathNodeData extends BaseNodeData {
  readonly category: MaterialNodeCategory.Math;
  readonly type: MathNodeType;
}

export interface OutputNodeData extends BaseNodeData {
  readonly category: MaterialNodeCategory.Output;
  readonly type: OutputNodeType;
}

export interface CodeNodeData extends BaseNodeData {
  readonly category: MaterialNodeCategory.Code;
  readonly glsl: string;
  readonly outputType: SocketType;
}

export type MaterialNodeData = InputNodeData | MathNodeData | OutputNodeData | CodeNodeData;

export interface MaterialGraphEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly sourceHandle: MaterialPortKey;
  readonly targetHandle: MaterialPortKey;
}

export interface MaterialGraphSnapshot {
  readonly nodes: MaterialNodeData[];
  readonly edges: MaterialGraphEdge[];
}

export interface CompileResult {
  readonly material: import('three').MeshPhysicalMaterial | import('three').Material;
  readonly diagnostics: readonly string[];
}
