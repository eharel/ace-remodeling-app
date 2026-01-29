import { Stack } from "expo-router";

/**
 * Layout for project detail nested routes
 *
 * This layout wraps all routes under /project/[id]/, including:
 * - index.tsx -> /project/[id] (main project detail screen)
 * - documents.tsx -> /project/[id]/documents
 * - photos/ -> /project/[id]/photos/*
 */
export default function ProjectDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        presentation: "card",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="documents"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
      {/* photos/ subdirectory has its own _layout.tsx */}
      <Stack.Screen
        name="photos"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
