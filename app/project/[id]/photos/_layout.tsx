import { Stack } from "expo-router";

export default function PhotosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // This ensures the transition from Grid to Gallery is a smooth horizontal push
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          presentation: "modal",
        }}
      />{" "}
      {/* The Grid */}
      <Stack.Screen name="viewer" /> {/* The Full Carousel */}
    </Stack>
  );
}
