import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useMindMapStore } from '../../store/useMindMapStore';
import { MindMapNodeComponent } from './MindMapNode';
import { ConnectionLines } from './ConnectionLines';
import { NodeEditor } from './NodeEditor';
import { computeTreeLayout } from '../../utils/treeLayout';
import { theme } from '../../theme/theme';

const CANVAS_SIZE = 4000;

export function MindMapCanvas() {
  const activeTabId = useMindMapStore((s) => s.activeTabId);
  const mindMaps = useMindMapStore((s) => s.mindMaps);
  const addNode = useMindMapStore((s) => s.addNode);
  const removeNode = useMindMapStore((s) => s.removeNode);
  const updateNodeText = useMindMapStore((s) => s.updateNodeText);
  const updateNodeColor = useMindMapStore((s) => s.updateNodeColor);
  const toggleCollapse = useMindMapStore((s) => s.toggleCollapse);
  const applyLayout = useMindMapStore((s) => s.applyLayout);

  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const mm = activeTabId ? mindMaps[activeTabId] : null;

  const handleDoubleTap = useCallback((nodeId: string) => {
    setEditingNodeId(nodeId);
  }, []);

  const handleAddChild = useCallback(
    (parentId: string) => {
      addNode(parentId);
    },
    [addNode],
  );

  const handleEditorSave = useCallback(
    (text: string, color: string) => {
      if (editingNodeId) {
        updateNodeText(editingNodeId, text);
        updateNodeColor(editingNodeId, color);
      }
    },
    [editingNodeId, updateNodeText, updateNodeColor],
  );

  const handleEditorDelete = useCallback(() => {
    if (editingNodeId) {
      removeNode(editingNodeId);
      setEditingNodeId(null);
    }
  }, [editingNodeId, removeNode]);

  const handleAddIdea = useCallback(() => {
    if (!mm) return;
    addNode(mm.rootNodeId);
  }, [mm, addNode]);

  const handleAutoLayout = useCallback(() => {
    if (!mm) return;
    const positions = computeTreeLayout(mm.rootNodeId, mm.nodes);
    applyLayout(positions);
  }, [mm, applyLayout]);

  if (!mm) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No mind map selected</Text>
      </View>
    );
  }

  const editingNode = editingNodeId ? mm.nodes[editingNodeId] || null : null;

  // Collect visible nodes
  const visibleNodeIds = new Set<string>();
  const collectVisible = (nodeId: string) => {
    const node = mm.nodes[nodeId];
    if (!node) return;
    visibleNodeIds.add(nodeId);
    if (!node.collapsed) {
      node.children.forEach(collectVisible);
    }
  };
  collectVisible(mm.rootNodeId);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.addIdeaBtn} onPress={handleAddIdea}>
          <Text style={styles.addIdeaBtnText}>+ 아이디어 추가</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={handleAutoLayout}>
          <Text style={styles.toolBtnText}>자동 정렬</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.canvasWrapper}>
        <View style={styles.canvas}>
          <ConnectionLines
            nodes={mm.nodes}
            rootNodeId={mm.rootNodeId}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
          />

          {Array.from(visibleNodeIds).map((nodeId) => {
            const node = mm.nodes[nodeId];
            if (!node) return null;
            return (
              <MindMapNodeComponent
                key={nodeId}
                node={node}
                zoom={mm.zoom}
                onDoubleTap={handleDoubleTap}
                onAddChild={handleAddChild}
              />
            );
          })}
        </View>
      </View>

      <NodeEditor
        visible={editingNodeId !== null}
        node={editingNode}
        onSave={handleEditorSave}
        onDelete={handleEditorDelete}
        onClose={() => setEditingNodeId(null)}
        isRoot={editingNode?.parentId === null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  toolbar: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  addIdeaBtn: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  addIdeaBtnText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  toolBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceHover,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toolBtnText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  canvasWrapper: {
    flex: 1,
    overflow: 'scroll' as any,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    position: 'relative',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textLight,
    fontSize: theme.fontSize.lg,
  },
});
