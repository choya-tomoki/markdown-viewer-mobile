import { create } from 'zustand';

interface EditorState {
  scrollPositions: Record<string, number>;

  setScrollPosition: (fileUri: string, position: number) => void;
  getScrollPosition: (fileUri: string) => number;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  scrollPositions: {},

  setScrollPosition: (fileUri, position) =>
    set((state) => ({
      scrollPositions: { ...state.scrollPositions, [fileUri]: position },
    })),

  getScrollPosition: (fileUri) => get().scrollPositions[fileUri] ?? 0,
}));
