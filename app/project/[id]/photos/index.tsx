import { ThemedText } from "@/shared/components";
import { useLocalSearchParams } from "expo-router";

export default function PhotoGridScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ThemedText>Photo Grid Screen, project id: {id}</ThemedText>;
}
