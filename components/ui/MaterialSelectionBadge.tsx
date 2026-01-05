'use client';

import { useMemo } from 'react';
import { useMaterialGraphStore } from '@/stores/materialGraph';

export function MaterialSelectionBadge() {
  const selectedNodeId = useMaterialGraphStore((state) => state.selectedNodeId);
  const nodes = useMaterialGraphStore((state) => state.nodes);

  const selectedLabel = useMemo(() => nodes.find((node) => node.id === selectedNodeId)?.data.title, [nodes, selectedNodeId]);

  if (!selectedNodeId) {
    return null;
  }

  return <div className="selection-badge">Previewing: {selectedLabel ?? selectedNodeId}</div>;
}
