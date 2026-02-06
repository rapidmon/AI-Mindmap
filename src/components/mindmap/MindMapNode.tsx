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
  canvasOffset: { x: number; y: number };
  zoom: number;
  onTap: (nodeId: string) => void;
  onAddChild: (nodeId: string) => void;
}

export const MindMapNodeComponent = React.memo(function MindMapNodeComponent({
  node,
  canvasOffset,
  zoom,
  onTap,
  onAddChild,
}: MindMapNodeProps) {
  const updateNodePosition = useMindMapStore((s) => s.updateNodePosition);

  const handleDragEnd = useCallback(
    (x: number, y: number) => {
      updateNodePosition(node.id, { x, y });
    },
    [node.id, updateNodePosition],
  );

  const { panGesture, animatedStyle } = useDragNode({
    initialX: node.position.x,
    initialY: node.position.y,
    onDragEnd: handleDragEnd,
    canvasOffset,
    zoom,
  });

  const handleTap = useCallback(() => {
    onTap(node.id);
  }, [node.id, onTap]);

  const handleAddChild = useCallback(() => {
    onAddChild(node.id);
  }, [node.id, onAddChild]);

  const isRoot = node.parentId === null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleTap}
          style={[
            styles.node,
            {
              backgroundColor: node.color,
              borderWidth: isRoot ? 3 : 1,
              borderColor: isRoot ? theme.colors.text : node.color,
            },
          ]}
        >
          <Text style={styles.nodeText} numberOfLines={2}>
            {node.text}
          </Text>
          {node.collapsed && node.children.length > 0 && (
            <View style={styles.collapsedBadge}>
              <Text style={styles.collapsedBadgeText}>{node.children.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleAddChild}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  node: {
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    ...theme.shadows.md,
  },
  nodeText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
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
    right: -14,
    top: NODE_HEIGHT / 2 - 12,
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
