import { NODE_WIDTH, NODE_HEIGHT } from './constants';

export function getNodeCenter(position: { x: number; y: number }) {
  return {
    x: position.x + NODE_WIDTH / 2,
    y: position.y + NODE_HEIGHT / 2,
  };
}

export function getNodeRight(position: { x: number; y: number }) {
  return {
    x: position.x + NODE_WIDTH,
    y: position.y + NODE_HEIGHT / 2,
  };
}

export function getNodeLeft(position: { x: number; y: number }) {
  return {
    x: position.x,
    y: position.y + NODE_HEIGHT / 2,
  };
}

export function cubicBezierPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const dx = Math.abs(to.x - from.x) * 0.5;
  const c1x = from.x + dx;
  const c1y = from.y;
  const c2x = to.x - dx;
  const c2y = to.y;
  return `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`;
}
