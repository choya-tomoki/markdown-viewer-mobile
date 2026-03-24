import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../src/themes/ThemeContext';
import { useAppStore } from '../../src/stores/appStore';
import { ThemeSelector } from '../../src/components/SettingsPanel/ThemeSelector';
import { FontFamilyPicker } from '../../src/components/SettingsPanel/FontFamilyPicker';
import { FontSizeControl } from '../../src/components/SettingsPanel/FontSizeControl';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const fontFamily = useAppStore((s) => s.fontFamily);
  const fontSize = useAppStore((s) => s.fontSize);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderColor }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Theme Section */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderLight }]}>
          <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>Theme</Text>
          <ThemeSelector />
        </View>

        {/* Font Size Section */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>TYPOGRAPHY</Text>
        <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderLight }]}>
          <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>Font Size</Text>
          <FontSizeControl />
        </View>

        {/* Font Family Section */}
        <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderLight, marginTop: 8 }]}>
          <Text style={[styles.cardLabel, { color: colors.textPrimary, marginBottom: 8 }]}>Font Family</Text>
          <FontFamilyPicker />
        </View>

        {/* Preview Section */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>PREVIEW</Text>
        <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderLight }]}>
          <Text
            style={[
              styles.previewText,
              {
                color: colors.textPrimary,
                fontFamily: fontFamily || undefined,
                fontSize: fontSize,
              },
            ]}
          >
            The quick brown fox jumps over the lazy dog.
          </Text>
          <Text
            style={[
              styles.previewText,
              {
                color: colors.textSecondary,
                fontFamily: fontFamily || undefined,
                fontSize: fontSize * 0.875,
                marginTop: 8,
              },
            ]}
          >
            0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ
          </Text>
        </View>

        {/* About Section */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderLight }]}>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.textPrimary }]}>Version</Text>
            <Text style={[styles.aboutValue, { color: colors.textSecondary }]}>1.0.0</Text>
          </View>
          <View style={[styles.aboutDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.textPrimary }]}>License</Text>
            <Text style={[styles.aboutValue, { color: colors.textSecondary }]}>MIT</Text>
          </View>
          <View style={[styles.aboutDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.textPrimary }]}>Editor</Text>
            <Text style={[styles.aboutValue, { color: colors.textSecondary }]}>TenTap (Tiptap)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  previewText: {
    lineHeight: 24,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  aboutLabel: {
    fontSize: 15,
  },
  aboutValue: {
    fontSize: 15,
  },
  aboutDivider: {
    height: 1,
    marginVertical: 8,
  },
});
