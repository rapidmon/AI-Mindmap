import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { MindMapNode } from '../../models/types';
import { getNodeRight, getNodeLeft, cubicBezierPath } from '../../utils/geometry';

interface ConnectionLinesProps {
  nodes: Record<string, MindMapNode>;
  rootNodeId: string;
  width: number;
  height: number;
}

function collectEdges(
  nodeId: string,
  nodes: Record<string, MindMapNode>,
  edges: { from: { x: number; y: number }; to: { x: number; y: number }; color: string }[],
) {
  const node = nodes[nodeId];
  if (!node || node.collapsed) return;

  const from = getNodeRight(node.position);

  for (const childId of node.children) {
    const child = nodes[childId];
    if (!child) continue;
    const to = getNodeLeft(child.position);
    edges.push({ from, to, color: node.color });
    collectEdges(childId, nodes, edges);
  }
}

export const ConnectionLines = React.memo(function ConnectionLines({
  nodes,
  rootNodeId,
  width,
  height,
}: ConnectionLinesProps) {
  const edges: { from: { x: number; y: number }; to: { x: number; y: number }; color: string }[] = [];
  collectEdges(rootNodeId, nodes, edges);

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {edges.map((edge, i) => (
        <Path
          key={i}
          d={cubicBezierPath(edge.from, edge.to)}
          stroke={edge.color}
          strokeWidth={2}
          fill="none"
          opacity={0.6}
        />
      ))}
    </Svg>
  );
});
