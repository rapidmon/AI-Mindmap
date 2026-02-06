export interface MindMapNode {
  id: string;
  text: string;
  position: { x: number; y: number };
  children: string[];
  parentId: string | null;
  color: string;
  collapsed: boolean;
}

export interface MindMap {
  id: string;
  title: string;
  rootNodeId: string;
  nodes: Record<string, MindMapNode>;
  canvasOffset: { x: number; y: number };
  zoom: number;
}

export interface Tab {
  id: string;
  title: string;
  order: number;
}

export type AIProvider = 'claude' | 'openai';

export interface AISettings {
  provider: AIProvider;
  claudeApiKey: string;
  openaiApiKey: string;
}

export interface AIResult {
  id: string;
  idea: string;
  description: string;
  timestamp: number;
}

export interface AppState {
  tabs: Tab[];
  activeTabId: string | null;
  mindMaps: Record<string, MindMap>;
}
