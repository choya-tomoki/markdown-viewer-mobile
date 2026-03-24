import { useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { useTabStore } from '../stores/tabStore';
import { fileSystemService } from '../services/fileSystemService';

export function useFileOperations() {
  const openTab = useTabStore((s) => s.openTab);
  const getActiveTab = useTabStore((s) => s.getActiveTab);
  const markTabClean = useTabStore((s) => s.markTabClean);

  const openFile = useCallback(async (): Promise<boolean> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/markdown', 'text/plain', 'text/*'],
        copyToCacheDirectory: false,
      });

      if (result.canceled || !result.assets?.[0]) return false;

      const asset = result.assets[0];
      const content = await fileSystemService.readFileContent(asset.uri);

      openTab({
        id: asset.uri,
        name: asset.name,
        uri: asset.uri,
        content,
        isDirty: false,
      });
      return true;
    } catch (error) {
      console.error('Failed to open file:', error);
      return false;
    }
  }, [openTab]);

  const saveFile = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const tab = getActiveTab();
    if (!tab) return { success: false, error: 'No file open' };
    if (!tab.isDirty) return { success: true };

    try {
      await fileSystemService.writeFileContent(tab.uri, tab.content);
      markTabClean(tab.id);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to save file:', error);
      return { success: false, error: message };
    }
  }, [getActiveTab, markTabClean]);

  const openFileFromUri = useCallback(
    async (uri: string, name: string): Promise<boolean> => {
      try {
        const content = await fileSystemService.readFileContent(uri);
        openTab({
          id: uri,
          name,
          uri,
          content,
          isDirty: false,
        });
        return true;
      } catch (error) {
        console.error('Failed to open file:', error);
        return false;
      }
    },
    [openTab]
  );

  return { openFile, saveFile, openFileFromUri };
}
