import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { useMindMapStore } from '../../store/useMindMapStore';
import { MindMapNodeComponent } from './MindMapNode';
import { ConnectionLines } from './ConnectionLines';
import { NodeEditor } from './NodeEditor';
import { computeTreeLayout } from '../../utils/treeLayout';
import { MIN_ZOOM, MAX_ZOOM } from '../../utils/constants';
import { theme } from '../../theme/theme';

const CANVAS_SIZE = 4000;

export function MindMapCanvas() {
  const activeTabId = useMindMapStore((s) => s.activeTabId);
  const mindMaps = useMindMapStore((s) => s.mindMaps);
  const addNode = useMindMapStore((s) => s.addNode);
  const removeNode = useMindMapStore((s) => s.removeNode);
  const updateNodeText = useMindMapStore((s) => s.updateNodeText);
  const updateNodeColor = useMindMapStore((s) => s.updateNodeColor);
  const applyLayout = useMindMapStore((s) => s.applyLayout);
  const setZoom = useMindMapStore((s) => s.setZoom);
  const setCanvasOffset = useMindMapStore((s) => s.setCanvasOffset);

  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

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

  // Zoom with mouse wheel
  const handleWheel = useCallback(
    (e: any) => {
      if (!mm) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, mm.zoom + delta));
      setZoom(next);
    },
    [mm, setZoom],
  );

  // Zoom buttons
  const handleZoomIn = useCallback(() => {
    if (!mm) return;
    setZoom(Math.min(MAX_ZOOM, mm.zoom + 0.15));
  }, [mm, setZoom]);

  const handleZoomOut = useCallback(() => {
    if (!mm) return;
    setZoom(Math.max(MIN_ZOOM, mm.zoom - 0.15));
  }, [mm, setZoom]);

  const handleZoomReset = useCallback(() => {
    if (!mm) return;
    setZoom(1);
    setCanvasOffset({ x: 0, y: 0 });
  }, [mm, setZoom, setCanvasOffset]);

  // Canvas panning via middle-click or right-click drag
  const handlePointerDown = useCallback(
    (e: any) => {
      if (!mm) return;
      // Middle button (1) or right button (2) or left on empty space
      if (e.button === 1 || e.button === 2) {
        e.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY };
        offsetStart.current = { ...mm.canvasOffset };
      }
    },
    [mm],
  );

  const handlePointerMove = useCallback(
    (e: any) => {
      if (!isPanning.current || !mm) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setCanvasOffset({
        x: offsetStart.current.x + dx,
        y: offsetStart.current.y + dy,
      });
    },
    [mm, setCanvasOffset],
  );

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleContextMenu = useCallback((e: any) => {
    e.preventDefault();
  }, []);

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

  const zoomPercent = Math.round(mm.zoom * 100);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.addIdeaBtn} onPress={handleAddIdea}>
          <Text style={styles.addIdeaBtnText}>+ 아이디어 추가</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={handleAutoLayout}>
          <Text style={styles.toolBtnText}>자동 정렬</Text>
        </TouchableOpacity>
        <View style={styles.zoomGroup}>
          <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut}>
            <Text style={styles.zoomBtnText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomLabel} onPress={handleZoomReset}>
            <Text style={styles.zoomLabelText}>{zoomPercent}%</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn}>
            <Text style={styles.zoomBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={styles.canvasWrapper}
        // @ts-ignore - web events
        onWheel={Platform.OS === 'web' ? handleWheel : undefined}
        onPointerDown={Platform.OS === 'web' ? handlePointerDown : undefined}
        onPointerMove={Platform.OS === 'web' ? handlePointerMove : undefined}
        onPointerUp={Platform.OS === 'web' ? handlePointerUp : undefined}
        onContextMenu={Platform.OS === 'web' ? handleContextMenu : undefined}
      >
        <View
          style={[
            styles.canvas,
            {
              transform: [
                { translateX: mm.canvasOffset.x },
                { translateY: mm.canvasOffset.y },
                { scale: mm.zoom },
              ],
            },
          ]}
        >
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
    alignItems: 'center',
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
  zoomGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto' as any,
    backgroundColor: theme.colors.surfaceHover,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  zoomBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  zoomLabel: {
    paddingHorizontal: theme.spacing.sm,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomLabelText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'center',
  },
  canvasWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    position: 'relative',
    transformOrigin: '0 0' as any,
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
