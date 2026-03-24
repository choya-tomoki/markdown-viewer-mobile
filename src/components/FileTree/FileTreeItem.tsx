import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../themes/ThemeContext';
import type { TreeNode } from '../../stores/fileTreeStore';

interface FileTreeItemProps {
  node: TreeNode;
  depth: number;
  isExpanded?: boolean;
  isSelected?: boolean;
  onPress: (node: TreeNode) => void;
}

export function FileTreeItem({
  node,
  depth,
  isExpanded,
  isSelected,
  onPress,
}: FileTreeItemProps) {
  const { colors } = useThemeContext();

  const iconName = node.isFolder
    ? isExpanded
      ? 'folder-open'
      : 'folder'
    : 'document-text-outline';

  const iconColor = node.isFolder ? '#e8a838' : colors.accentColor;

  return (
    <Pressable
      onPress={() => onPress(node)}
      style={({ pressed }) => [
        styles.container,
        { paddingLeft: 16 + depth * 16 },
        isSelected && { backgroundColor: colors.accentLight },
        pressed && { backgroundColor: colors.tabHoverBg },
      ]}
      android_ripple={{ color: colors.accentLight }}
    >
      {node.isFolder && (
        <Ionicons
          name={isExpanded ? 'chevron-down' : 'chevron-forward'}
          size={14}
          color={colors.textTertiary}
          style={styles.chevron}
        />
      )}
      {!node.isFolder && <View style={styles.chevronPlaceholder} />}
      <Ionicons name={iconName} size={18} color={iconColor} style={styles.icon} />
      <Text
        style={[styles.name, { color: colors.textPrimary }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {node.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingRight: 16,
  },
  chevron: {
    marginRight: 4,
    width: 14,
  },
  chevronPlaceholder: {
    width: 14,
    marginRight: 4,
  },
  icon: {
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    flex: 1,
  },
});
