import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { useZoom } from "./hooks/useZoom";
import { ZoomContainerProps } from "./types/zoom.types";

export const ZoomContainer: React.FC<ZoomContainerProps> = ({
  children,
  zoomConfig,
  style,
  onZoomChange,
  onZoomStart,
  onZoomEnd,
}) => {
  const {
    scale,
    translateX,
    translateY,
    isZoomed,
    isPanning,
    isZooming,
    pinchGesture,
    resetZoom,
    getCurrentState,
    config,
  } = useZoom({
    config: zoomConfig,
    onZoomChange,
    onZoomStart,
    onZoomEnd,
  });

  // Animated style for the zoomable content
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  }, [scale, translateX, translateY]);

  // Container style
  const containerStyle = useMemo(() => [styles.container, style], [style]);

  return (
    <View style={containerStyle}>
      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[styles.zoomableContent, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  zoomableContent: {
    flex: 1,
  },
});
