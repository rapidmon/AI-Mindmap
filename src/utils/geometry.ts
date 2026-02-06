import { NODE_WIDTH, NODE_HEIGHT } from './constants';

export function getNodeCenter(position: { x: number; y: number }) {
  return {
    x: position.x + NODE_WIDTH / 2,
    y: position.y + NODE_HEIGHT / 2,
  };
}

/**
 * Curved path from parent center to child center.
 * The control point is pulled toward the midpoint, creating
 * a smooth organic curve (like octopus tentacles).
 */
export function radialBezierPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  // Offset the control point perpendicular to the line for a slight curve
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curvature = dist * 0.15;
  // Perpendicular offset (rotated 90°)
  const nx = -dy / (dist || 1) * curvature;
  const ny = dx / (dist || 1) * curvature;

  const cx = mx + nx;
  const cy = my + ny;

  return `M ${from.x} ${from.y} Q ${cx} ${cy}, ${to.x} ${to.y}`;
}
