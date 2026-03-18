import React, { useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

interface VideoPlayerProps {
  uri: string;
  containerStyle: StyleProp<ViewStyle>;
  /** True when this item is the active page in the carousel — pauses on navigation away */
  isActive: boolean;
}

/**
 * VideoPlayer — renders a video in the gallery carousel using expo-video.
 *
 * Uses native controls (play/pause, scrubber, fullscreen) provided by VideoView.
 * Automatically pauses when the user swipes away to another item.
 */
export function VideoPlayer({ uri, containerStyle, isActive }: VideoPlayerProps) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  // Pause when the carousel navigates away from this item
  useEffect(() => {
    if (!isActive) {
      player.pause();
    }
  }, [isActive, player]);

  return (
    <VideoView
      style={containerStyle}
      player={player}
      nativeControls
      allowsFullscreen
      allowsPictureInPicture={false}
    />
  );
}
