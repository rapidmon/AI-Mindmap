import React, { useCallback } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { MindMapNode as NodeType } from '../../models/types';
import { useDragNode } from '../../hooks/useDragNode';
import { useMindMapStore } from '../../store/useMindMapStore';
import { NODE_WIDTH, NODE_HEIGHT } from '../../utils/constants';
import { theme } from '../../theme/theme';

interface MindMapNodeProps {
  node: NodeType;
  zoom: number;
  onDoubleTap: (nodeId: string) => void;
  onAddChild: (nodeId: string) => void;
}

export const MindMapNodeComponent = React.memo(function MindMapNodeComponent({
  node,
  zoom,
  onDoubleTap,
  onAddChild,
}: MindMapNodeProps) {
  const moveSubtree = useMindMapStore((s) => s.moveSubtree);

  const handleDragEnd = useCallback(
    (x: number, y: number) => {
      const dx = x - node.position.x;
      const dy = y - node.position.y;
      moveSubtree(node.id, dx, dy);
    },
    [node.id, node.position.x, node.position.y, moveSubtree],
  );

  const handleDoubleTap = useCallback(() => {
    onDoubleTap(node.id);
  }, [node.id, onDoubleTap]);

  const { composedGesture, dragStyle } = useDragNode({
    onDragEnd: handleDragEnd,
    onDoubleTap: handleDoubleTap,
    startX: node.position.x,
    startY: node.position.y,
    zoom,
  });

  const handleAddChild = useCallback(() => {
    onAddChild(node.id);
  }, [node.id, onAddChild]);

  const isRoot = node.parentId === null;
  const nodeW = isRoot ? NODE_WIDTH : NODE_WIDTH * 0.85;
  const nodeH = isRoot ? NODE_HEIGHT + 8 : NODE_HEIGHT;

  return (
    <View
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
      }}
    >
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={dragStyle}>
          <View
            style={[
              styles.node,
              {
                width: nodeW,
                height: nodeH,
                borderRadius: nodeH / 2,
                backgroundColor: node.color,
                borderWidth: isRoot ? 3 : 1.5,
                borderColor: isRoot ? theme.colors.text : 'rgba(255,255,255,0.3)',
              },
            ]}
          >
            <Text
              style={[styles.nodeText, isRoot && styles.rootText]}
              numberOfLines={2}
            >
              {node.text}
            </Text>
            {node.collapsed && node.children.length > 0 && (
              <View style={styles.collapsedBadge}>
                <Text style={styles.collapsedBadgeText}>
                  {node.children.length}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.addButton, { left: nodeW / 2 - 12, top: nodeH + 2 }]}
            onPress={handleAddChild}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  node: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.md,
  },
  nodeText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  rootText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  collapsedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.colors.warning,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  addButton: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  addButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    lineHeight: 18,
    fontWeight: '700',
  },
});
