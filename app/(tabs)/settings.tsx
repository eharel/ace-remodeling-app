import { currentEnvironment, currentProjectId } from "@/core/config";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
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
  const { updateRequired } = useVersionCheck();

  const { isAuthenticated, signIn, signOut } = useAuth();
  const [pinInput, setPinInput] = useState("");
  const [isEnabling, setIsEnabling] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleEnableEditMode = () => {
    setIsEnabling(true);
    setErrorMessage("");
  };

  const handleCancelPin = () => {
    setIsEnabling(false);
    setPinInput("");
    setErrorMessage("");
  };

  const handleSubmitPin = async () => {
    if (!pinInput.trim()) {
      setErrorMessage("Please enter a PIN");
      return;
    }

    const success = await signIn(pinInput);

    if (success) {
      setIsEnabling(false);
      setPinInput("");
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid PIN. Please try again.");
      setPinInput("");
    }
  };

  const handleDisableEditMode = () => {
    if (Platform.OS === "ios") {
      Alert.alert(
        "Disable Edit Mode",
        "Are you sure you want to return to read-only mode?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            style: "destructive",
            onPress: signOut,
          },
        ]
      );
    } else {
      signOut();
    }
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
        editModeSection: {
          marginBottom: DesignTokens.spacing[6],
          padding: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.lg,
        },
        sectionHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: DesignTokens.spacing[2],
        },
        sectionDescription: {
          marginBottom: DesignTokens.spacing[4],
        },
        badge: {
          paddingHorizontal: DesignTokens.spacing[2],
          paddingVertical: DesignTokens.spacing[1],
          borderRadius: DesignTokens.borderRadius.sm,
        },
        badgeText: {
          fontSize: DesignTokens.typography.fontSize.xs,
          fontWeight: DesignTokens.typography.fontWeight.bold as any,
          letterSpacing: 0.5,
        },
        button: {
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.md,
          alignItems: "center",
          alignSelf: "flex-start",
        },
        disableButton: {
          backgroundColor: "transparent",
          borderWidth: 1,
        },
        buttonText: {
          fontSize: DesignTokens.typography.fontSize.base,
          fontWeight: DesignTokens.typography.fontWeight.semibold as any,
        },
        pinInputContainer: {
          marginTop: DesignTokens.spacing[2],
        },
        pinLabel: {
          marginBottom: DesignTokens.spacing[2],
        },
        pinInput: {
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 1,
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: DesignTokens.typography.fontWeight.medium as any,
          letterSpacing: 4,
          textAlign: "center",
        },
        errorText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          marginTop: DesignTokens.spacing[2],
        },
        pinButtonRow: {
          flexDirection: "row",
          marginTop: DesignTokens.spacing[4],
        },
        pinButton: {
          flex: 1,
          paddingVertical: DesignTokens.spacing[3],
          borderRadius: DesignTokens.borderRadius.md,
          alignItems: "center",
        },
        cancelButton: {
          backgroundColor: "transparent",
          borderWidth: 1,
          marginRight: DesignTokens.spacing[2],
        },
        submitButton: {
          // Background color set dynamically
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
        {/* Update Banner - Shows when app needs updating */}
        {updateRequired && <UpdateBanner updateRequired={updateRequired} />}

        {/* Appearance Section */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Appearance
          </ThemedText>
          <ThemeToggle />
        </View>

        {/* Edit Mode Section */}
        <ThemedView variant="card" style={styles.editModeSection}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Edit Mode
            </ThemedText>
            {isAuthenticated && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.colors.status.success },
                ]}
              >
                <ThemedText
                  style={[
                    styles.badgeText,
                    { color: theme.colors.text.inverse },
                  ]}
                >
                  ENABLED
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText variant="caption" style={styles.sectionDescription}>
            {isAuthenticated
              ? "Edit mode is enabled. You can add photos and update project information."
              : "Enable edit mode to add photos, update projects, and manage content."}
          </ThemedText>

          {!isAuthenticated && !isEnabling && (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.colors.components.button.primary },
              ]}
              onPress={handleEnableEditMode}
              activeOpacity={DesignTokens.interactions.activeOpacity}
            >
              <ThemedText
                style={[
                  styles.buttonText,
                  { color: theme.colors.text.inverse },
                ]}
              >
                Enable Edit Mode
              </ThemedText>
            </TouchableOpacity>
          )}

          {!isAuthenticated && isEnabling && (
            <View style={styles.pinInputContainer}>
              <ThemedText variant="body" style={styles.pinLabel}>
                Enter PIN to enable edit mode:
              </ThemedText>

              <RNTextInput
                value={pinInput}
                onChangeText={(text) => {
                  setPinInput(text);
                  setErrorMessage("");
                }}
                placeholder="Enter PIN"
                placeholderTextColor={theme.colors.components.input.placeholder}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSubmitPin}
                style={[
                  styles.pinInput,
                  {
                    backgroundColor: theme.colors.components.input.background,
                    borderColor: errorMessage
                      ? theme.colors.status.error
                      : theme.colors.components.input.border,
                    color: theme.colors.text.primary,
                  },
                ]}
              />
              {errorMessage && (
                <ThemedText
                  style={[
                    styles.errorText,
                    { color: theme.colors.status.error },
                  ]}
                >
                  {errorMessage}
                </ThemedText>
              )}
              <View style={styles.pinButtonRow}>
                <TouchableOpacity
                  style={[
                    styles.pinButton,
                    styles.cancelButton,
                    { borderColor: theme.colors.border.primary },
                  ]}
                  onPress={handleCancelPin}
                  activeOpacity={DesignTokens.interactions.activeOpacity}
                >
                  <ThemedText style={{ color: theme.colors.text.secondary }}>
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.pinButton,
                    styles.submitButton,
                    {
                      backgroundColor: theme.colors.components.button.primary,
                    },
                  ]}
                  onPress={handleSubmitPin}
                  activeOpacity={DesignTokens.interactions.activeOpacity}
                >
                  <ThemedText style={{ color: theme.colors.text.inverse }}>
                    Submit
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isAuthenticated && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.disableButton,
                { borderColor: theme.colors.status.error },
              ]}
              onPress={handleDisableEditMode}
              activeOpacity={DesignTokens.interactions.activeOpacity}
            >
              <ThemedText
                style={[
                  styles.buttonText,
                  { color: theme.colors.status.error },
                ]}
              >
                Disable Edit Mode
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

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
