import { useCallback } from 'react';
import { Platform } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { DRAG_ACTIVATE_DELAY } from '../utils/constants';

interface UseDragNodeOptions {
  initialX: number;
  initialY: number;
  onDragEnd: (x: number, y: number) => void;
  canvasOffset: { x: number; y: number };
  zoom: number;
}

export function useDragNode({
  initialX,
  initialY,
  onDragEnd,
  canvasOffset,
  zoom,
}: UseDragNodeOptions) {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const isDragging = useSharedValue(false);
  const scale = useSharedValue(1);

  const updatePosition = useCallback(
    (x: number, y: number) => {
      onDragEnd(x, y);
    },
    [onDragEnd],
  );

  const syncPosition = useCallback(
    (x: number, y: number) => {
      translateX.value = x;
      translateY.value = y;
    },
    [translateX, translateY],
  );

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(DRAG_ACTIVATE_DELAY)
    .onStart(() => {
      isDragging.value = true;
      scale.value = withSpring(1.05);
    })
    .onUpdate((event) => {
      translateX.value = initialX + event.translationX / zoom;
      translateY.value = initialY + event.translationY / zoom;
    })
    .onEnd(() => {
      isDragging.value = false;
      scale.value = withSpring(1);
      runOnJS(updatePosition)(translateX.value, translateY.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: translateX.value,
    top: translateY.value,
    transform: [{ scale: scale.value }],
    zIndex: isDragging.value ? 100 : 1,
  }));

  return {
    panGesture,
    animatedStyle,
    syncPosition,
    translateX,
    translateY,
  };
}
