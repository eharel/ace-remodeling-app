import { Stack } from "expo-router";

/**
 * Layout for photos routes under /project/[id]/photos/
 * - index.tsx -> Photo grid view
 * - viewer.tsx -> Full carousel view
 */
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
        // options={{
        //   presentation: "modal",
        // }}
      />
      <Stack.Screen name="viewer" />
    </Stack>
  );
}
