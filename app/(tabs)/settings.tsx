import { currentEnvironment, currentProjectId } from "@/core/config";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import packageJson from "../../package.json";

import { DesignTokens } from "@/core/themes";
import { UpdateBanner } from "@/features/settings";
import {
  PageHeader,
  ThemedText,
  ThemedView,
  ThemeToggle,
} from "@/shared/components";
import { useAuth, useTheme } from "@/shared/contexts";
import { useVersionCheck } from "@/shared/hooks";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { updateRequired, isLoading } = useVersionCheck();

  // Temporary test code to verify PIN authentication
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const [pinInput, setPinInput] = useState("");
  const [message, setMessage] = useState("");

  const handleSignIn = async () => {
    const success = await signIn(pinInput);
    setMessage(success ? "Sign in successful!" : "Invalid PIN");
    setPinInput("");
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background.primary,
        },
        scrollView: {
          flex: 1,
        },
        content: {
          padding: DesignTokens.spacing[4],
        },
        section: {
          marginBottom: DesignTokens.spacing[6],
        },
        sectionTitle: {
          marginBottom: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[2],
        },
        aboutContainer: {
          backgroundColor: theme.colors.background.card,
          padding: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.sm,
        },
        infoItem: {
          flexDirection: "row",
          alignItems: "center",
          padding: DesignTokens.spacing[4],
          marginBottom: DesignTokens.spacing[2],
          borderRadius: DesignTokens.borderRadius.md,
        },
        infoItemIcon: {
          marginRight: DesignTokens.spacing[3],
        },
        infoItemContent: {
          flex: 1,
        },
        infoItemTitle: {
          marginBottom: DesignTokens.spacing[1],
        },
        infoItemDescription: {
          opacity: 0.7,
        },
        infoItemChevron: {
          marginLeft: DesignTokens.spacing[2],
        },
        versionInfo: {
          textAlign: "center",
          opacity: 0.6,
          marginTop: DesignTokens.spacing[2],
        },
      }),
    [theme]
  );

  return (
    <ThemedView style={styles.container}>
      <PageHeader title="Settings" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Temporary test UI for PIN authentication */}
        <View style={{ padding: DesignTokens.spacing[4] }}>
          <ThemedText variant="body">
            Current user: {user?.displayName}
          </ThemedText>
          <ThemedText variant="body">Role: {user?.role}</ThemedText>
          <ThemedText variant="body">
            Authenticated: {isAuthenticated ? "Yes" : "No"}
          </ThemedText>

          {!isAuthenticated && (
            <>
              <TextInput
                value={pinInput}
                onChangeText={setPinInput}
                placeholder="Enter PIN"
                secureTextEntry
                style={{
                  borderWidth: 1,
                  padding: DesignTokens.spacing[3],
                  marginVertical: DesignTokens.spacing[3],
                  borderRadius: DesignTokens.borderRadius.md,
                  borderColor: theme.colors.border.primary,
                  color: theme.colors.text.primary,
                  backgroundColor: theme.colors.background.card,
                }}
              />
              <Button title="Sign In" onPress={handleSignIn} />
            </>
          )}

          {isAuthenticated && <Button title="Sign Out" onPress={signOut} />}

          {message ? (
            <ThemedText
              variant="body"
              style={{ marginTop: DesignTokens.spacing[2] }}
            >
              {message}
            </ThemedText>
          ) : null}
        </View>

        {/* Update Banner - Shows when app needs updating */}
        {updateRequired && <UpdateBanner updateRequired={updateRequired} />}

        {/* Appearance Section */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Appearance
          </ThemedText>
          <ThemeToggle />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            About
          </ThemedText>

          <ThemedView style={styles.aboutContainer}>
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() => router.push("/about-company")}
              activeOpacity={DesignTokens.interactions.activeOpacity}
            >
              <MaterialIcons
                name="business"
                size={24}
                color={theme.colors.text.secondary}
                style={styles.infoItemIcon}
              />
              <View style={styles.infoItemContent}>
                <ThemedText variant="body" style={styles.infoItemTitle}>
                  Company Info
                </ThemedText>
                <ThemedText
                  variant="caption"
                  style={styles.infoItemDescription}
                >
                  About ACE Remodeling TX
                </ThemedText>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={theme.colors.text.secondary}
                style={styles.infoItemChevron}
              />
            </TouchableOpacity>

            <View style={styles.infoItem}>
              <MaterialIcons
                name="info"
                size={24}
                color={theme.colors.text.secondary}
                style={styles.infoItemIcon}
              />
              <View style={styles.infoItemContent}>
                <ThemedText variant="body" style={styles.infoItemTitle}>
                  App Version
                </ThemedText>
                <ThemedText
                  variant="caption"
                  style={styles.infoItemDescription}
                >
                  ACE Remodeling App v{packageJson.version}
                </ThemedText>
              </View>
            </View>

            <ThemedText variant="caption" style={styles.versionInfo}>
              Built for ACE Remodeling TX • Transforming Austin Homes
            </ThemedText>
          </ThemedView>
        </View>

        {__DEV__ && (
          <ThemedText
            variant="caption"
            style={{
              marginTop: DesignTokens.spacing[5],
              opacity: 0.6,
            }}
          >
            Environment: {currentEnvironment}
            {"\n"}Project: {currentProjectId}
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}
