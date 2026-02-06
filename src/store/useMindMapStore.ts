import { create } from 'zustand';
import { MindMap, MindMapNode, Tab, AppState } from '../models/types';
import {
  StorageKeys,
  loadFromStorage,
  debouncedSave,
} from '../services/storage/storageService';
import { STORAGE_DEBOUNCE_MS, DEFAULT_NODE_COLOR, CANVAS_CENTER_X, CANVAS_CENTER_Y, NODE_WIDTH, NODE_HEIGHT, RADIAL_FIRST_RING } from '../utils/constants';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function createRootNode(text: string): MindMapNode {
  return {
    id: generateId(),
    text,
    position: { x: CANVAS_CENTER_X - NODE_WIDTH / 2, y: CANVAS_CENTER_Y - NODE_HEIGHT / 2 },
    children: [],
    parentId: null,
    color: DEFAULT_NODE_COLOR,
    collapsed: false,
  };
}

function createDefaultMindMap(title: string): MindMap {
  const root = createRootNode(title);
  return {
    id: generateId(),
    title,
    rootNodeId: root.id,
    nodes: { [root.id]: root },
    canvasOffset: { x: 0, y: 0 },
    zoom: 1,
  };
}

interface MindMapStore extends AppState {
  isLoaded: boolean;

  // Lifecycle
  loadState: () => Promise<void>;

  // Tab actions
  addTab: (title?: string) => void;
  removeTab: (tabId: string) => void;
  renameTab: (tabId: string, title: string) => void;
  setActiveTab: (tabId: string) => void;

  // Node actions
  addNode: (parentId: string, text?: string) => void;
  removeNode: (nodeId: string) => void;
  updateNodeText: (nodeId: string, text: string) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  moveSubtree: (nodeId: string, dx: number, dy: number) => void;
  updateNodeColor: (nodeId: string, color: string) => void;
  toggleCollapse: (nodeId: string) => void;

  // Canvas actions
  setCanvasOffset: (offset: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;

  // Auto-layout
  applyLayout: (positions: Record<string, { x: number; y: number }>) => void;

  // Selectors
  getActiveMindMap: () => MindMap | null;
}

function persist(state: MindMapStore) {
  const { tabs, activeTabId, mindMaps } = state;
  debouncedSave(StorageKeys.MINDMAP, { tabs, activeTabId, mindMaps }, STORAGE_DEBOUNCE_MS);
}

export const useMindMapStore = create<MindMapStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  mindMaps: {},
  isLoaded: false,

  loadState: async () => {
    const saved = await loadFromStorage<AppState>(StorageKeys.MINDMAP);

    // Validate saved data: tabs exist, active map exists and has a valid root
    if (saved && saved.tabs.length > 0 && saved.mindMaps) {
      const activeId = saved.activeTabId || saved.tabs[0].id;
      const activeMm = saved.mindMaps[activeId];
      if (activeMm && activeMm.nodes && activeMm.nodes[activeMm.rootNodeId]) {
        set({ ...saved, activeTabId: activeId, isLoaded: true });
        return;
      }
    }

    // Saved data missing or corrupted — start fresh
    const mm = createDefaultMindMap('My Ideas');
    const tab: Tab = { id: mm.id, title: mm.title, order: 0 };
    set({
      tabs: [tab],
      activeTabId: mm.id,
      mindMaps: { [mm.id]: mm },
      isLoaded: true,
    });
    persist(get());
  },

  addTab: (title?: string) => {
    const name = title || `Topic ${get().tabs.length + 1}`;
    const mm = createDefaultMindMap(name);
    const tab: Tab = { id: mm.id, title: name, order: get().tabs.length };
    set((s) => ({
      tabs: [...s.tabs, tab],
      activeTabId: mm.id,
      mindMaps: { ...s.mindMaps, [mm.id]: mm },
    }));
    persist(get());
  },

  removeTab: (tabId: string) => {
    const state = get();
    const remaining = state.tabs.filter((t) => t.id !== tabId);
    if (remaining.length === 0) return; // keep at least one
    const newMaps = { ...state.mindMaps };
    delete newMaps[tabId];
    const newActive =
      state.activeTabId === tabId ? remaining[0].id : state.activeTabId;
    set({ tabs: remaining, activeTabId: newActive, mindMaps: newMaps });
    persist(get());
  },

  renameTab: (tabId: string, title: string) => {
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === tabId ? { ...t, title } : t)),
      mindMaps: {
        ...s.mindMaps,
        [tabId]: s.mindMaps[tabId]
          ? { ...s.mindMaps[tabId], title }
          : s.mindMaps[tabId],
      },
    }));
    persist(get());
  },

  setActiveTab: (tabId: string) => {
    set({ activeTabId: tabId });
    persist(get());
  },

  addNode: (parentId: string, text?: string) => {
    const state = get();
    const mmId = state.activeTabId;
    if (!mmId) return;
    const mm = state.mindMaps[mmId];
    if (!mm) return;

    const parent = mm.nodes[parentId];
    if (!parent) return;

    // Place new child radially around the parent
    const siblingCount = parent.children.length;
    const angle = (2 * Math.PI / Math.max(siblingCount + 1, 3)) * siblingCount;
    const radius = parent.parentId === null ? RADIAL_FIRST_RING : 160;
    const newNode: MindMapNode = {
      id: generateId(),
      text: text || 'New Idea',
      position: {
        x: parent.position.x + Math.cos(angle) * radius,
        y: parent.position.y + Math.sin(angle) * radius,
      },
      children: [],
      parentId,
      color: parent.color,
      collapsed: false,
    };

    const updatedParent = {
      ...parent,
      children: [...parent.children, newNode.id],
    };

    set((s) => ({
      mindMaps: {
        ...s.mindMaps,
        [mmId]: {
          ...mm,
          nodes: {
            ...mm.nodes,
            [parentId]: updatedParent,
            [newNode.id]: newNode,
          },
        },
      },
    }));
    persist(get());
  },

  removeNode: (nodeId: string) => {
    const state = get();
    const mmId = state.activeTabId;
    if (!mmId) return;
    const mm = state.mindMaps[mmId];
    if (!mm || nodeId === mm.rootNodeId) return;

    // Collect all descendants
    const toRemove = new Set<string>();
    const collect = (id: string) => {
      toRemove.add(id);
      const node = mm.nodes[id];
      if (node) node.children.forEach(collect);
    };
    collect(nodeId);

    const node = mm.nodes[nodeId];
    const newNodes = { ...mm.nodes };
    toRemove.forEach((id) => delete newNodes[id]);

    // Remove from parent's children
    if (node?.parentId && newNodes[node.parentId]) {
      newNodes[node.parentId] = {
        ...newNodes[node.parentId],
        children: newNodes[node.parentId].children.filter((c) => c !== nodeId),
      };
    }

    set((s) => ({
      mindMaps: {
        ...s.mindMaps,
        [mmId]: { ...mm, nodes: newNodes },
      },
    }));
    persist(get());
  },

  updateNodeText: (nodeId: string, text: string) => {
    const state = get();
    const mmId = state.activeTabId;
    if (!mmId) return;
    const mm = state.mindMaps[mmId];
    if (!mm || !mm.nodes[nodeId]) return;

    set((s) => ({
      mindMaps: {
        ...s.mindMaps,
        [mmId]: {
          ...mm,
          nodes: {
            ...mm.nodes,
            [nodeId]: { ...mm.nodes[nodeId], text },
          },
        },
      },
    }));
    persist(get());
  },

  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => {
    const state = get();
    const mmId = state.activeTabId;
    if (!mmId) return;
    const mm = state.mindMaps[mmId];
    if (!mm || !mm.nodes[nodeId]) return;

    set((s) => ({
      mindMaps: {
        ...s.mindMaps,
        [mmId]: {
          ...mm,
          nodes: {
            ...mm.nodes,
            [nodeId]: { ...mm.nodes[nodeId], position },
          },
        },
      },
    }));
    persist(get());
  },

  moveSubtree: (nodeId: string, dx: number, dy: number) => {
    const state = get();
    const mmId = state.activeTabId;
    if (!mmId) return;
    const mm = state.mindMaps[mmId];
    if (!mm || !mm.nodes[nodeId]) return;

    // Collect this node + all descendants
    const ids: string[] = [];
    const collect = (id: string) => {
      ids.push(id);
      const n = mm.nodes[id];
      if (n) n.children.forEach(collect);
    };
    collect(nodeId);

    const newNodes = { ...mm.nodes };
    for (const id of ids) {
      const n = newNodes[id];
      newNodes[id] = {
        ...n,
        position: { x: n.position.x + dx, y: n.position.y + dy },
      };
    }

    set((s) => ({
      mindMaps: {
        ...s.mindMaps,
        [mmId]: { ...mm, nodes: newNodes },
      },
    }));
    persist(get());
  },

  updateNodeColor: (nodeId: string, color: string) => {
    const state = get();
    const mmId = state.activeTabId;
    if (!mmId) return;
    const mm = state.mindMaps[mmId];
    if (!mm || !mm.nodes[nodeId]) return;

    set((s) => ({
      mindMaps: {
        ...s.mindMaps,
        [mmId]: {
          ...mm,
          nodes: {
            ...mm.nodes,
            [nodeId]: { ...mm.nodes[nodeId], color },
          },
        },
      },
    }));
    persist(get());
  },

  toggleCollapse: (nodeId: string) => {
    const state = get();
    const mmId = state.activeTabId;
    if (!mmId) return;
    const mm = state.mindMaps[mmId];
    if (!mm || !mm.nodes[nodeId]) return;

    set((s) => ({
      mindMaps: {
        ...s.mindMaps,
        [mmId]: {
          ...mm,
          nodes: {
            ...mm.nodes,
            [nodeId]: {
              ...mm.nodes[nodeId],
              collapsed: !mm.nodes[nodeId].collapsed,
            },
          },
        },
      },
    }));
    persist(get());
  },

  setCanvasOffset: (offset: { x: number; y: number }) => {
    const state = get();
    const mmId = state.activeTabId;
    if (!mmId) return;
    const mm = state.mindMaps[mmId];
    if (!mm) return;

    set((s) => ({
      mindMaps: {
        ...s.mindMaps,
        [mmId]: { ...mm, canvasOffset: offset },
      },
    }));
    persist(get());
  },

  setZoom: (zoom: number) => {
    const state = get();
    const mmId = state.activeTabId;
    if (!mmId) return;
    const mm = state.mindMaps[mmId];
    if (!mm) return;

    set((s) => ({
      mindMaps: {
        ...s.mindMaps,
        [mmId]: { ...mm, zoom },
      },
    }));
    persist(get());
  },

  applyLayout: (positions: Record<string, { x: number; y: number }>) => {
    const state = get();
    const mmId = state.activeTabId;
    if (!mmId) return;
    const mm = state.mindMaps[mmId];
    if (!mm) return;

    const newNodes = { ...mm.nodes };
    for (const [id, pos] of Object.entries(positions)) {
      if (newNodes[id]) {
        newNodes[id] = { ...newNodes[id], position: pos };
      }
    }

    set((s) => ({
      mindMaps: {
        ...s.mindMaps,
        [mmId]: { ...mm, nodes: newNodes },
      },
    }));
    persist(get());
  },

  getActiveMindMap: () => {
    const state = get();
    if (!state.activeTabId) return null;
    return state.mindMaps[state.activeTabId] || null;
  },
}));
