import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../../themes/ThemeContext';
import { useTabStore } from '../../stores/tabStore';

export function EditorStatusBar() {
  const { colors } = useThemeContext();
  const activeTab = useTabStore((s) => {
    const id = s.activeTabId;
    return id ? s.tabs.find((t) => t.id === id) : undefined;
  });

  if (!activeTab) return null;

  const charCount = activeTab.content.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary, borderTopColor: colors.borderColor }]}>
      <Text
        style={[styles.path, { color: colors.textTertiary }]}
        numberOfLines={1}
        ellipsizeMode="head"
      >
        {activeTab.name}
      </Text>
      <Text style={[styles.separator, { color: colors.borderColor }]}>|</Text>
      <Text style={[styles.info, { color: colors.textTertiary }]}>UTF-8</Text>
      <Text style={[styles.separator, { color: colors.borderColor }]}>|</Text>
      <Text style={[styles.info, { color: colors.textTertiary }]}>
        {charCount.toLocaleString()} chars
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 28,
    borderTopWidth: 1,
  },
  path: {
    fontSize: 11,
    flex: 1,
  },
  separator: {
    fontSize: 11,
    marginHorizontal: 8,
  },
  info: {
    fontSize: 11,
  },
});
