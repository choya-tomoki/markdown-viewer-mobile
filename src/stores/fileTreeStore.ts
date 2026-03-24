import { create } from 'zustand';

export interface TreeNode {
  id: string;
  name: string;
  uri: string;
  isFolder: boolean;
  children?: TreeNode[];
  mimeType?: string;
  size?: number;
  lastModified?: number;
}

interface FileTreeState {
  openedFolderUri: string | null;
  openedFolderName: string | null;
  treeData: TreeNode[];
  selectedFileUri: string | null;

  setOpenedFolder: (uri: string | null, name: string | null) => void;
  setTreeData: (data: TreeNode[]) => void;
  setSelectedFile: (uri: string | null) => void;
  reset: () => void;
}

export const useFileTreeStore = create<FileTreeState>((set) => ({
  openedFolderUri: null,
  openedFolderName: null,
  treeData: [],
  selectedFileUri: null,

  setOpenedFolder: (uri, name) =>
    set({ openedFolderUri: uri, openedFolderName: name }),
  setTreeData: (data) => set({ treeData: data }),
  setSelectedFile: (uri) => set({ selectedFileUri: uri }),
  reset: () =>
    set({
      openedFolderUri: null,
      openedFolderName: null,
      treeData: [],
      selectedFileUri: null,
    }),
}));
