import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';

interface UseDragNodeOptions {
  onDragEnd: (x: number, y: number) => void;
  onDoubleTap: () => void;
  startX: number;
  startY: number;
  zoom: number;
}

export function useDragNode({
  onDragEnd,
  onDoubleTap,
  startX,
  startY,
  zoom,
}: UseDragNodeOptions) {
  // Offset from the node's resting position (0,0 = no drag happening)
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const scale = useSharedValue(1);

  const commitDrag = useCallback(
    (dx: number, dy: number) => {
      onDragEnd(startX + dx, startY + dy);
    },
    [onDragEnd, startX, startY],
  );

  const fireDoubleTap = useCallback(() => {
    onDoubleTap();
  }, [onDoubleTap]);

  const panGesture = Gesture.Pan()
    .minDistance(5)
    .onStart(() => {
      isDragging.value = true;
      scale.value = withSpring(1.05);
    })
    .onUpdate((event) => {
      offsetX.value = event.translationX / zoom;
      offsetY.value = event.translationY / zoom;
    })
    .onEnd(() => {
      isDragging.value = false;
      scale.value = withSpring(1);
      const dx = offsetX.value;
      const dy = offsetY.value;
      offsetX.value = 0;
      offsetY.value = 0;
      runOnJS(commitDrag)(dx, dy);
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(fireDoubleTap)();
    });

  const composedGesture = Gesture.Exclusive(doubleTapGesture, panGesture);

  // Only the drag offset is animated — base position comes from regular styles
  const dragStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
    zIndex: isDragging.value ? 100 : 1,
  }));

  return {
    composedGesture,
    dragStyle,
  };
}
