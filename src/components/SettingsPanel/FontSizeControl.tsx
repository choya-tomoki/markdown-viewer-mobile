import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../themes/ThemeContext';
import { useAppStore } from '../../stores/appStore';
import { fontSizeRange } from '../../themes/typography';

export function FontSizeControl() {
  const { colors } = useThemeContext();
  const fontSize = useAppStore((s) => s.fontSize);
  const setFontSize = useAppStore((s) => s.setFontSize);

  const canDecrease = fontSize > fontSizeRange.min;
  const canIncrease = fontSize < fontSizeRange.max;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setFontSize(fontSize - fontSizeRange.step)}
        disabled={!canDecrease}
        style={[
          styles.button,
          {
            backgroundColor: colors.bgTertiary,
            opacity: canDecrease ? 1 : 0.3,
          },
        ]}
      >
        <Ionicons name="remove" size={20} color={colors.textPrimary} />
      </Pressable>
      <View style={[styles.valueContainer, { borderColor: colors.borderLight }]}>
        <Text style={[styles.value, { color: colors.textPrimary }]}>{fontSize}px</Text>
      </View>
      <Pressable
        onPress={() => setFontSize(fontSize + fontSizeRange.step)}
        disabled={!canIncrease}
        style={[
          styles.button,
          {
            backgroundColor: colors.bgTertiary,
            opacity: canIncrease ? 1 : 0.3,
          },
        ]}
      >
        <Ionicons name="add" size={20} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
});
