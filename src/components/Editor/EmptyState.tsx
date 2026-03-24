import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../themes/ThemeContext';

interface EmptyStateProps {
  onOpenFile: () => void;
}

export function EmptyState({ onOpenFile }: EmptyStateProps) {
  const { colors } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: colors.editorBg }]}>
      <Ionicons name="document-text-outline" size={64} color={colors.borderColor} />
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        No file open
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Open a Markdown file to start editing
      </Text>
      <Pressable
        style={[styles.button, { backgroundColor: colors.accentColor }]}
        onPress={onOpenFile}
      >
        <Ionicons name="folder-open-outline" size={18} color="#ffffff" />
        <Text style={styles.buttonText}>Open File</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
