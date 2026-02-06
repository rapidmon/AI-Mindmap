import { MindMap, MindMapNode } from '../../models/types';

function buildTreeText(
  nodeId: string,
  nodes: Record<string, MindMapNode>,
  depth: number = 0,
): string {
  const node = nodes[nodeId];
  if (!node) return '';
  const indent = '  '.repeat(depth);
  let text = `${indent}- ${node.text}\n`;
  for (const childId of node.children) {
    text += buildTreeText(childId, nodes, depth + 1);
  }
  return text;
}

export function buildSynthesisPrompt(mindMap: MindMap): string {
  const treeText = buildTreeText(mindMap.rootNodeId, mindMap.nodes);

  return `You are a creative brainstorming assistant. The user has built a mind map with the following structure:

Topic: ${mindMap.title}

Mind Map:
${treeText}

Based on ALL the nodes and their relationships in this mind map, synthesize and suggest 3 creative new ideas that:
1. Combine concepts from different branches in unexpected ways
2. Identify gaps or unexplored connections between existing ideas
3. Propose innovative directions that build on the existing thought patterns

For each idea, provide:
- A short title (3-7 words)
- A brief description (1-2 sentences explaining the idea and how it connects to existing nodes)

Respond in JSON format:
[
  {"idea": "Title here", "description": "Description here"},
  {"idea": "Title here", "description": "Description here"},
  {"idea": "Title here", "description": "Description here"}
]

Respond ONLY with the JSON array, no other text.`;
}
