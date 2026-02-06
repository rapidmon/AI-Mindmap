import { MindMapNode } from '../models/types';
import {
  NODE_HEIGHT,
  NODE_HORIZONTAL_GAP,
  NODE_VERTICAL_GAP,
  NODE_WIDTH,
  ROOT_NODE_X,
  ROOT_NODE_Y,
} from './constants';

interface LayoutResult {
  [nodeId: string]: { x: number; y: number };
}

function getSubtreeHeight(
  nodeId: string,
  nodes: Record<string, MindMapNode>,
): number {
  const node = nodes[nodeId];
  if (!node) return NODE_HEIGHT;
  if (node.collapsed || node.children.length === 0) return NODE_HEIGHT;

  let totalHeight = 0;
  for (const childId of node.children) {
    totalHeight += getSubtreeHeight(childId, nodes);
  }
  totalHeight += (node.children.length - 1) * NODE_VERTICAL_GAP;
  return Math.max(totalHeight, NODE_HEIGHT);
}

function layoutSubtree(
  nodeId: string,
  nodes: Record<string, MindMapNode>,
  x: number,
  yStart: number,
  result: LayoutResult,
): void {
  const node = nodes[nodeId];
  if (!node) return;

  const subtreeH = getSubtreeHeight(nodeId, nodes);
  const nodeY = yStart + subtreeH / 2 - NODE_HEIGHT / 2;
  result[nodeId] = { x, y: nodeY };

  if (node.collapsed || node.children.length === 0) return;

  const childX = x + NODE_WIDTH + NODE_HORIZONTAL_GAP;
  let currentY = yStart;

  for (const childId of node.children) {
    const childH = getSubtreeHeight(childId, nodes);
    layoutSubtree(childId, nodes, childX, currentY, result);
    currentY += childH + NODE_VERTICAL_GAP;
  }
}

export function computeTreeLayout(
  rootNodeId: string,
  nodes: Record<string, MindMapNode>,
): LayoutResult {
  const result: LayoutResult = {};
  layoutSubtree(rootNodeId, nodes, ROOT_NODE_X, ROOT_NODE_Y, result);
  return result;
}
