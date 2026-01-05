'use client';

import type { ComponentType } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { MaterialNodeData, PortDefinition } from '@/lib/materials/types';
import { SocketType } from '@/lib/materials/types';
import { getPortsForNode } from '@/lib/materials/schema';

function socketTone(socketType: SocketType): string {
  switch (socketType) {
    case SocketType.Vec3:
    case SocketType.Color:
      return 'rgb(148, 163, 184)';
    case SocketType.Vec2:
      return 'rgb(94, 234, 212)';
    case SocketType.Float:
    default:
      return 'rgb(244, 114, 182)';
  }
}

function renderHandles(ports: PortDefinition[], position: Position) {
  return ports.map((port) => (
    <div key={port.key} className="shader-node__port">
      {position === Position.Left ? <span className="shader-node__label">{port.label}</span> : null}
      <Handle
        id={port.key}
        type={position === Position.Left ? 'target' : 'source'}
        position={position}
        style={{ background: socketTone(port.socketType) }}
      />
      {position === Position.Right ? <span className="shader-node__label">{port.label}</span> : null}
    </div>
  ));
}

export function ShaderNode({ data, selected }: NodeProps<MaterialNodeData>) {
  const { inputs, outputs } = getPortsForNode(data);

  return (
    <div className={`shader-node shader-node--${data.category} ${selected ? 'is-selected' : ''}`}>
      <div className="shader-node__header">
        <div className="shader-node__pill">{data.category}</div>
        <div className="shader-node__title">{data.title}</div>
      </div>
      <div className="shader-node__body">
        <div className="shader-node__handles shader-node__handles--inputs">{renderHandles(inputs, Position.Left)}</div>
        <div className="shader-node__handles shader-node__handles--outputs">{renderHandles(outputs, Position.Right)}</div>
      </div>
    </div>
  );
}

export const nodeTypes = { material: ShaderNode } satisfies Record<string, ComponentType<NodeProps<MaterialNodeData>>>;
