import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import type { TreeNode } from '../stores/fileTreeStore';
import { MARKDOWN_EXTENSIONS, IGNORED_DIRECTORIES } from '../constants/fileTypes';

function isMarkdownExtension(filename: string): boolean {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return (MARKDOWN_EXTENSIONS as readonly string[]).includes(ext);
}

function extractNameFromUri(uri: string): string {
  const decoded = decodeURIComponent(uri);
  const segments = decoded.split('/');
  const last = segments[segments.length - 1] || '';
  // Handle SAF URI encoding where %2F is used
  if (last.includes('%2F')) {
    return decodeURIComponent(last.split('%2F').pop() || last);
  }
  return last;
}

export const fileSystemService = {
  async requestDirectoryAccess(): Promise<{ uri: string; name: string } | null> {
    const permissions =
      await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) return null;
    const name = extractNameFromUri(permissions.directoryUri);
    return { uri: permissions.directoryUri, name };
  },

  async readDirectoryRecursive(
    dirUri: string,
    depth: number = 0,
    maxDepth: number = 10
  ): Promise<TreeNode[]> {
    if (depth >= maxDepth) return [];

    try {
      const entries = await StorageAccessFramework.readDirectoryAsync(dirUri);
      const nodes: TreeNode[] = [];

      for (const entryUri of entries) {
        const name = extractNameFromUri(entryUri);

        if (name.startsWith('.')) continue;
        if ((IGNORED_DIRECTORIES as readonly string[]).includes(name)) continue;

        // Try to determine if it's a directory by attempting to read it
        // SAF URIs for files typically end with a document name with extension
        const hasExtension = name.includes('.') && name.lastIndexOf('.') > 0;

        if (!hasExtension) {
          // Likely a folder - try to read as directory
          try {
            const children = await fileSystemService.readDirectoryRecursive(
              entryUri,
              depth + 1,
              maxDepth
            );
            if (children.length > 0) {
              nodes.push({
                id: entryUri,
                name,
                uri: entryUri,
                isFolder: true,
                children,
              });
            }
          } catch {
            // Not a directory, skip
          }
        } else if (isMarkdownExtension(name)) {
          nodes.push({
            id: entryUri,
            name,
            uri: entryUri,
            isFolder: false,
            mimeType: 'text/markdown',
          });
        }
      }

      return nodes.sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch {
      return [];
    }
  },

  async readFileContent(uri: string): Promise<string> {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  },

  async writeFileContent(uri: string, content: string): Promise<void> {
    await FileSystem.writeAsStringAsync(uri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  },

  extractFolderName(uri: string): string {
    return extractNameFromUri(uri) || 'Documents';
  },
};
