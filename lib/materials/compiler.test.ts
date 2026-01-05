import { describe, expect, it } from 'vitest';
import { compileMaterialGraph } from './compiler';
import {
  InputNodeType,
  MaterialGraphSnapshot,
  MaterialNodeCategory,
  OutputNodeType,
  SocketType,
  MATERIAL_PORT_KEYS,
} from './types';

function buildGraphWithCodeNode(glsl: string): MaterialGraphSnapshot {
  return {
    nodes: [
      {
        id: 'primary',
        title: 'Primary Color',
        category: MaterialNodeCategory.Input,
        type: InputNodeType.Color,
        color: '#ff0000',
      },
      {
        id: 'secondary',
        title: 'Secondary Color',
        category: MaterialNodeCategory.Input,
        type: InputNodeType.Color,
        color: '#0000ff',
      },
      {
        id: 'code',
        title: 'CodeNode',
        category: MaterialNodeCategory.Code,
        glsl,
        outputType: SocketType.Vec3,
      },
      {
        id: 'output-base',
        title: 'Base Color',
        category: MaterialNodeCategory.Output,
        type: OutputNodeType.BaseColor,
      },
      {
        id: 'output-emissive',
        title: 'Emissive',
        category: MaterialNodeCategory.Output,
        type: OutputNodeType.Emissive,
      },
    ],
    edges: [
      {
        id: 'edge-primary',
        source: 'primary',
        target: 'code',
        sourceHandle: MATERIAL_PORT_KEYS.out,
        targetHandle: MATERIAL_PORT_KEYS.primary,
      },
      {
        id: 'edge-secondary',
        source: 'secondary',
        target: 'code',
        sourceHandle: MATERIAL_PORT_KEYS.out,
        targetHandle: MATERIAL_PORT_KEYS.secondary,
      },
      {
        id: 'edge-base',
        source: 'code',
        target: 'output-base',
        sourceHandle: MATERIAL_PORT_KEYS.out,
        targetHandle: MATERIAL_PORT_KEYS.input,
      },
      {
        id: 'edge-emissive',
        source: 'code',
        target: 'output-emissive',
        sourceHandle: MATERIAL_PORT_KEYS.out,
        targetHandle: MATERIAL_PORT_KEYS.input,
      },
    ],
  };
}

describe('compileMaterialGraph with CodeNode', () => {
  it('applies code node output to base color and emissive channels', () => {
    const graph = buildGraphWithCodeNode('return vec3(1.0);');
    const { material, diagnostics } = compileMaterialGraph(graph);

    expect(diagnostics).toHaveLength(0);
    expect(material.colorNode).toBe(material.emissiveNode);

    const mixNode = material.colorNode as any;

    expect(mixNode.method).toBe('mix');
    expect(mixNode.aNode).toBeDefined();
    expect(mixNode.bNode).toBeDefined();

    const factorNode = mixNode.cNode as any;
    expect(factorNode.functionNode?.code).toContain('return vec3(1.0);');
  });
});
