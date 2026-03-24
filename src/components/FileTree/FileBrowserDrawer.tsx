import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerHeader } from './DrawerHeader';
import { FileTreeList } from './FileTreeList';
import { useThemeContext } from '../../themes/ThemeContext';
import { useFileTreeStore } from '../../stores/fileTreeStore';
import { useAppStore } from '../../stores/appStore';
import { fileSystemService } from '../../services/fileSystemService';
import { useFileOperations } from '../../hooks/useFileOperations';
import type { TreeNode } from '../../stores/fileTreeStore';

export function FileBrowserDrawer() {
  const { colors } = useThemeContext();
  const {
    openedFolderUri,
    openedFolderName,
    treeData,
    selectedFileUri,
    setOpenedFolder,
    setTreeData,
    setSelectedFile,
  } = useFileTreeStore();
  const { addRecentFolder, recentFolders } = useAppStore();
  const { openFileFromUri } = useFileOperations();
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenFolder = useCallback(async () => {
    try {
      const result = await fileSystemService.requestDirectoryAccess();
      if (!result) return;

      setIsLoading(true);
      setOpenedFolder(result.uri, result.name);
      addRecentFolder(result.uri, result.name);

      const tree = await fileSystemService.readDirectoryRecursive(result.uri);
      setTreeData(tree);
    } catch (error) {
      console.error('Failed to open folder:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setOpenedFolder, addRecentFolder, setTreeData]);

  const handleRefresh = useCallback(async () => {
    if (!openedFolderUri) return;
    setIsLoading(true);
    try {
      const tree = await fileSystemService.readDirectoryRecursive(openedFolderUri);
      setTreeData(tree);
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsLoading(false);
    }
  }, [openedFolderUri, setTreeData]);

  const handleFilePress = useCallback(
    (node: TreeNode) => {
      setSelectedFile(node.uri);
      openFileFromUri(node.uri, node.name);
    },
    [setSelectedFile, openFileFromUri]
  );

  const handleRecentFolder = useCallback(
    async (uri: string, name: string) => {
      setIsLoading(true);
      setOpenedFolder(uri, name);
      try {
        const tree = await fileSystemService.readDirectoryRecursive(uri);
        setTreeData(tree);
      } catch (error) {
        console.error('Failed to open recent folder:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [setOpenedFolder, setTreeData]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.drawerBg }]}>
      <DrawerHeader
        folderName={openedFolderName}
        onOpenFolder={handleOpenFolder}
        onRefresh={openedFolderUri ? handleRefresh : undefined}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentColor} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Scanning files...
          </Text>
        </View>
      ) : treeData.length > 0 ? (
        <FileTreeList
          nodes={treeData}
          selectedFileUri={selectedFileUri}
          onFilePress={handleFilePress}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {openedFolderUri ? (
            <>
              <Ionicons name="alert-circle-outline" size={32} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No Markdown files found
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="folder-outline" size={48} color={colors.borderColor} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No folder opened
              </Text>
              <Text style={[styles.emptyHint, { color: colors.textTertiary }]}>
                Tap the folder icon above to browse files
              </Text>
            </>
          )}

          {!openedFolderUri && recentFolders.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={[styles.recentTitle, { color: colors.textTertiary }]}>
                RECENT FOLDERS
              </Text>
              {recentFolders.map((folder) => (
                <Pressable
                  key={folder.uri}
                  style={({ pressed }) => [
                    styles.recentItem,
                    pressed && { backgroundColor: colors.tabHoverBg },
                  ]}
                  onPress={() => handleRecentFolder(folder.uri, folder.name)}
                >
                  <Ionicons name="time-outline" size={16} color={colors.textTertiary} />
                  <Text
                    style={[styles.recentName, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {folder.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  recentSection: {
    marginTop: 32,
    alignSelf: 'stretch',
  },
  recentTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 8,
    borderRadius: 6,
  },
  recentName: {
    fontSize: 14,
    flex: 1,
  },
});
