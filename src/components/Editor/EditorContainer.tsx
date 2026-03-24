import React, { useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TenTapEditor } from './TenTapEditor';
import { EditorToolbar } from './EditorToolbar';
import { EmptyState } from './EmptyState';
import { useThemeContext } from '../../themes/ThemeContext';
import { useTabStore } from '../../stores/tabStore';
import { useAppStore } from '../../stores/appStore';
import { useFileOperations } from '../../hooks/useFileOperations';

export function EditorContainer() {
  const { colors, isDark } = useThemeContext();
  const activeTab = useTabStore((s) => {
    const id = s.activeTabId;
    return id ? s.tabs.find((t) => t.id === id) : undefined;
  });
  const { updateTabContent, markTabDirty } = useTabStore();
  const fontFamily = useAppStore((s) => s.fontFamily);
  const fontSize = useAppStore((s) => s.fontSize);
  const { openFile, saveFile } = useFileOperations();

  const handleChange = useCallback(
    (content: string) => {
      if (activeTab) {
        updateTabContent(activeTab.id, content);
        markTabDirty(activeTab.id);
      }
    },
    [activeTab?.id, updateTabContent, markTabDirty]
  );

  if (!activeTab) {
    return <EmptyState onOpenFile={openFile} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.editorWrapper, { backgroundColor: colors.editorBg }]}>
        <TenTapEditor
          key={activeTab.id}
          content={activeTab.content}
          onChange={handleChange}
          isDark={isDark}
          fontFamily={fontFamily}
          fontSize={fontSize}
        />
      </View>
      <EditorToolbar editor={null} onSave={activeTab.isDirty ? saveFile : undefined} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editorWrapper: {
    flex: 1,
  },
});
