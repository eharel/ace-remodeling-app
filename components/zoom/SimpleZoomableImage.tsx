import { Image } from "expo-image";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import { useSimpleZoom } from "./hooks/useSimpleZoom";
import { ZoomableImageProps } from "./types/zoom.types";

export const SimpleZoomableImage: React.FC<ZoomableImageProps> = ({
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
  const { animatedStyle, pinchGesture } = useSimpleZoom({
    config: zoomConfig,
    onZoomChange,
    onZoomStart,
    onZoomEnd,
  });

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
