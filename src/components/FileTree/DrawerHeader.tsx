import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../themes/ThemeContext';

interface DrawerHeaderProps {
  folderName: string | null;
  onOpenFolder: () => void;
  onRefresh?: () => void;
}

export function DrawerHeader({ folderName, onOpenFolder, onRefresh }: DrawerHeaderProps) {
  const { colors } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary, borderBottomColor: colors.borderColor }]}>
      <View style={styles.titleRow}>
        <Ionicons name="document-text" size={20} color={colors.accentColor} />
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {folderName || 'Markdown Viewer'}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onOpenFolder} style={styles.actionButton} hitSlop={8}>
          <Ionicons name="folder-open-outline" size={20} color={colors.accentColor} />
        </Pressable>
        {onRefresh && (
          <Pressable onPress={onRefresh} style={styles.actionButton} hitSlop={8}>
            <Ionicons name="refresh" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
  },
});
