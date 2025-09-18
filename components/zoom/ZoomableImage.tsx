import { Image } from "expo-image";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { useZoom } from "./hooks/useZoom";
import { ZoomableImageProps } from "./types/zoom.types";

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  source,
  style,
  contentFit = "contain",
  zoomConfig,
  onZoomChange,
  onZoomStart,
  onZoomEnd,
  children,
  accessibilityLabel,
  accessibilityHint,
  onLoad,
  onError,
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

  // Animated style for the zoomable container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  }, [scale, translateX, translateY]);

  // Container style that ensures proper bounds
  const containerStyle = useMemo(() => [styles.container, style], [style]);

  // Image style
  const imageStyle = useMemo(
    () => [styles.image, { width: "100%", height: "100%" }],
    []
  );

  return (
    <View style={containerStyle}>
      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[styles.zoomableContainer, animatedStyle]}>
          <Image
            source={source}
            style={imageStyle}
            contentFit={contentFit}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityRole="image"
            accessibilityState={{
              expanded: isZoomed.value,
            }}
            onLoad={onLoad}
            onError={onError}
          />
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
  zoomableContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    flex: 1,
  },
});
