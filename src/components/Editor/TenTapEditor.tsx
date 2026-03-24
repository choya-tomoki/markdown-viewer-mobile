import React from 'react';
import { StyleSheet } from 'react-native';
import {
  useEditorBridge,
  RichText,
  TenTapStartKit,
  CoreBridge,
} from '@10play/tentap-editor';
import { getEditorCSS } from '../../themes/editorThemes';

interface TenTapEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  isDark: boolean;
  fontFamily: string;
  fontSize: number;
  editable?: boolean;
}

export function TenTapEditor({
  content,
  onChange,
  isDark,
  fontFamily,
  fontSize,
  editable = true,
}: TenTapEditorProps) {
  const editorCSS = getEditorCSS(isDark, fontFamily, fontSize);

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: content,
    editable,
    bridgeExtensions: [
      ...TenTapStartKit,
      CoreBridge.configureCSS(editorCSS),
    ],
    onChange: () => {
      editor.getHTML().then((html) => {
        // TenTap returns HTML; for now we pass it through
        // In a future iteration, convert HTML to Markdown
        onChange(html);
      });
    },
  });

  return (
    <RichText
      editor={editor}
      style={styles.editor}
    />
  );
}

export { useEditorBridge };

const styles = StyleSheet.create({
  editor: {
    flex: 1,
  },
});
