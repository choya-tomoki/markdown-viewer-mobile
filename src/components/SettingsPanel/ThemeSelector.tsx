import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../themes/ThemeContext';
import { useAppStore, type ThemeMode } from '../../stores/appStore';

const themeOptions: { label: string; value: ThemeMode; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Light', value: 'light', icon: 'sunny' },
  { label: 'Dark', value: 'dark', icon: 'moon' },
  { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
];

export function ThemeSelector() {
  const { colors } = useThemeContext();
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <View style={styles.container}>
      {themeOptions.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => setTheme(option.value)}
          style={[
            styles.option,
            {
              backgroundColor: theme === option.value ? colors.accentLight : colors.bgPrimary,
              borderColor: theme === option.value ? colors.accentColor : colors.borderLight,
            },
          ]}
        >
          <Ionicons
            name={option.icon}
            size={18}
            color={theme === option.value ? colors.accentColor : colors.textSecondary}
          />
          <Text
            style={[
              styles.optionText,
              {
                color: theme === option.value ? colors.accentColor : colors.textSecondary,
                fontWeight: theme === option.value ? '600' : '400',
              },
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 14,
  },
});
