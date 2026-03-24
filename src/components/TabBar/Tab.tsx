import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../themes/ThemeContext';

interface TabProps {
  name: string;
  isActive: boolean;
  isDirty: boolean;
  onPress: () => void;
  onClose: () => void;
}

export function Tab({ name, isActive, isDirty, onPress, onClose }: TabProps) {
  const { colors } = useThemeContext();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: isActive ? colors.tabActiveBg : colors.tabBarBg,
          borderBottomColor: isActive ? colors.accentColor : 'transparent',
          borderRightColor: colors.borderLight,
        },
      ]}
    >
      <View style={styles.content}>
        {isDirty && (
          <View style={[styles.dirtyDot, { backgroundColor: colors.accentColor }]} />
        )}
        <Text
          style={[
            styles.name,
            { color: isActive ? colors.textPrimary : colors.textSecondary },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {name}
        </Text>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={styles.closeButton}
        hitSlop={8}
      >
        <Ionicons name="close" size={14} color={colors.textTertiary} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 4,
    height: 36,
    borderBottomWidth: 2,
    borderRightWidth: 1,
    minWidth: 100,
    maxWidth: 200,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dirtyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  name: {
    fontSize: 13,
    flex: 1,
  },
  closeButton: {
    padding: 6,
    borderRadius: 4,
  },
});
