import { MindMapNode } from '../models/types';
import {
  NODE_WIDTH,
  NODE_HEIGHT,
  RADIAL_FIRST_RING,
  RADIAL_RING_GAP,
  RADIAL_MIN_SPREAD,
  CANVAS_CENTER_X,
  CANVAS_CENTER_Y,
} from './constants';

interface LayoutResult {
  [nodeId: string]: { x: number; y: number };
}

/** Count visible (non-collapsed) leaves in a subtree */
function countLeaves(
  nodeId: string,
  nodes: Record<string, MindMapNode>,
): number {
  const node = nodes[nodeId];
  if (!node) return 1;
  if (node.collapsed || node.children.length === 0) return 1;
  let total = 0;
  for (const childId of node.children) {
    total += countLeaves(childId, nodes);
  }
  return total;
}

/**
 * Radial layout: root at center, children spread in a ring around it,
 * grandchildren in the next ring, etc.
 *
 * @param nodeId    current node
 * @param nodes     all nodes map
 * @param depth     distance from root (0 = root)
 * @param angleFrom start angle of this node's wedge (radians)
 * @param angleTo   end angle of this node's wedge (radians)
 * @param result    output positions
 */
function layoutRadial(
  nodeId: string,
  nodes: Record<string, MindMapNode>,
  depth: number,
  angleFrom: number,
  angleTo: number,
  result: LayoutResult,
): void {
  const node = nodes[nodeId];
  if (!node) return;

  if (depth === 0) {
    // Root goes in the center
    result[nodeId] = {
      x: CANVAS_CENTER_X - NODE_WIDTH / 2,
      y: CANVAS_CENTER_Y - NODE_HEIGHT / 2,
    };
  } else {
    const midAngle = (angleFrom + angleTo) / 2;
    const radius = RADIAL_FIRST_RING + (depth - 1) * RADIAL_RING_GAP;
    result[nodeId] = {
      x: CANVAS_CENTER_X + Math.cos(midAngle) * radius - NODE_WIDTH / 2,
      y: CANVAS_CENTER_Y + Math.sin(midAngle) * radius - NODE_HEIGHT / 2,
    };
  }

  if (node.collapsed || node.children.length === 0) return;

  // Distribute children within the wedge proportional to their subtree size
  const totalLeaves = node.children.reduce(
    (sum, cid) => sum + countLeaves(cid, nodes),
    0,
  );

  let currentAngle = angleFrom;
  for (const childId of node.children) {
    const childLeaves = countLeaves(childId, nodes);
    const share = childLeaves / totalLeaves;
    const wedge = (angleTo - angleFrom) * share;

    // Apply minimum spread so tiny branches don't collapse to a line
    const effectiveWedge = Math.max(wedge, RADIAL_MIN_SPREAD / (depth + 1));

    layoutRadial(
      childId,
      nodes,
      depth + 1,
      currentAngle,
      currentAngle + effectiveWedge,
      result,
    );
    currentAngle += wedge;
  }
}

export function computeTreeLayout(
  rootNodeId: string,
  nodes: Record<string, MindMapNode>,
): LayoutResult {
  const result: LayoutResult = {};
  // Full 360° circle
  layoutRadial(rootNodeId, nodes, 0, 0, 2 * Math.PI, result);
  return result;
}
