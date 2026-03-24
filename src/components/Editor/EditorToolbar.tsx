import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../themes/ThemeContext';
import type { EditorBridge } from '@10play/tentap-editor';

interface ToolbarButton {
  icon: keyof typeof Ionicons.glyphMap;
  action: () => void;
  label: string;
}

interface EditorToolbarProps {
  editor: EditorBridge | null;
  onSave?: () => void;
}

export function EditorToolbar({ editor, onSave }: EditorToolbarProps) {
  const { colors } = useThemeContext();

  if (!editor) return null;

  const buttons: ToolbarButton[] = [
    { icon: 'text', action: () => editor.toggleBold(), label: 'Bold' },
    { icon: 'pencil-outline', action: () => editor.toggleItalic(), label: 'Italic' },
    { icon: 'code-slash', action: () => editor.toggleCode(), label: 'Code' },
    { icon: 'reorder-four', action: () => editor.toggleHeading(1), label: 'H1' },
    { icon: 'reorder-three', action: () => editor.toggleHeading(2), label: 'H2' },
    { icon: 'list', action: () => editor.toggleBulletList(), label: 'List' },
    { icon: 'checkbox-outline', action: () => editor.toggleTaskList(), label: 'Task' },
    { icon: 'chatbox-outline', action: () => editor.toggleBlockquote(), label: 'Quote' },
    { icon: 'arrow-undo', action: () => editor.undo(), label: 'Undo' },
    { icon: 'arrow-redo', action: () => editor.redo(), label: 'Redo' },
  ];

  if (onSave) {
    buttons.push({ icon: 'save-outline', action: onSave, label: 'Save' });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary, borderTopColor: colors.borderColor }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {buttons.map((button) => (
          <Pressable
            key={button.label}
            onPress={button.action}
            style={({ pressed }) => [
              styles.button,
              pressed && { backgroundColor: colors.accentLight },
            ]}
          >
            <Ionicons name={button.icon} size={20} color={colors.textPrimary} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 2,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
});
