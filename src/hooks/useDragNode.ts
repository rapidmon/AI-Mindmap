import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';

interface UseDragNodeOptions {
  initialX: number;
  initialY: number;
  onDragEnd: (x: number, y: number) => void;
  onDoubleTap: () => void;
  zoom: number;
}

export function useDragNode({
  initialX,
  initialY,
  onDragEnd,
  onDoubleTap,
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
      translateX.value = initialX + event.translationX / zoom;
      translateY.value = initialY + event.translationY / zoom;
    })
    .onEnd(() => {
      isDragging.value = false;
      scale.value = withSpring(1);
      runOnJS(updatePosition)(translateX.value, translateY.value);
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(fireDoubleTap)();
    });

  // Double tap takes priority; if not matched, pan handles the gesture
  const composedGesture = Gesture.Exclusive(doubleTapGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: translateX.value,
    top: translateY.value,
    transform: [{ scale: scale.value }],
    zIndex: isDragging.value ? 100 : 1,
  }));

  return {
    composedGesture,
    animatedStyle,
    translateX,
    translateY,
  };
}
