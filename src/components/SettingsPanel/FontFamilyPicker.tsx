import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../themes/ThemeContext';
import { useAppStore } from '../../stores/appStore';
import { fontFamilies } from '../../themes/typography';

export function FontFamilyPicker() {
  const { colors } = useThemeContext();
  const fontFamily = useAppStore((s) => s.fontFamily);
  const setFontFamily = useAppStore((s) => s.setFontFamily);

  return (
    <View style={styles.container}>
      {fontFamilies.map((font) => (
        <Pressable
          key={font.value}
          onPress={() => setFontFamily(font.value)}
          style={[
            styles.item,
            {
              backgroundColor: fontFamily === font.value ? colors.accentLight : 'transparent',
              borderBottomColor: colors.borderLight,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color: colors.textPrimary,
                fontFamily: font.value || undefined,
              },
            ]}
          >
            {font.label}
          </Text>
          {fontFamily === font.value && (
            <Ionicons name="checkmark" size={20} color={colors.accentColor} />
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 15,
  },
});
