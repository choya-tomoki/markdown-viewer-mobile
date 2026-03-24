import React, { useState, useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { FileTreeItem } from './FileTreeItem';
import type { TreeNode } from '../../stores/fileTreeStore';

interface FileTreeListProps {
  nodes: TreeNode[];
  selectedFileUri: string | null;
  onFilePress: (node: TreeNode) => void;
}

interface FlatNode {
  node: TreeNode;
  depth: number;
}

export function FileTreeList({ nodes, selectedFileUri, onFilePress }: FileTreeListProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const flattenTree = useCallback(
    (treeNodes: TreeNode[], depth: number): FlatNode[] => {
      const result: FlatNode[] = [];
      for (const node of treeNodes) {
        result.push({ node, depth });
        if (node.isFolder && expandedFolders.has(node.id) && node.children) {
          result.push(...flattenTree(node.children, depth + 1));
        }
      }
      return result;
    },
    [expandedFolders]
  );

  const flatData = flattenTree(nodes, 0);

  const handlePress = useCallback(
    (node: TreeNode) => {
      if (node.isFolder) {
        toggleFolder(node.id);
      } else {
        onFilePress(node);
      }
    },
    [toggleFolder, onFilePress]
  );

  return (
    <FlatList
      data={flatData}
      keyExtractor={(item) => item.node.id}
      renderItem={({ item }) => (
        <FileTreeItem
          node={item.node}
          depth={item.depth}
          isExpanded={expandedFolders.has(item.node.id)}
          isSelected={item.node.uri === selectedFileUri}
          onPress={handlePress}
        />
      )}
      style={styles.list}
      getItemLayout={(_, index) => ({
        length: 40,
        offset: 40 * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
