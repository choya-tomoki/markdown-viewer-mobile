import React, { useRef } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Tab } from './Tab';
import { useThemeContext } from '../../themes/ThemeContext';
import { useTabStore } from '../../stores/tabStore';

export function TabBar() {
  const { colors } = useThemeContext();
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const setActiveTab = useTabStore((s) => s.setActiveTab);
  const closeTab = useTabStore((s) => s.closeTab);
  const scrollRef = useRef<ScrollView>(null);

  if (tabs.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.tabBarBg, borderBottomColor: colors.borderLight }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            name={tab.name}
            isActive={tab.id === activeTabId}
            isDirty={tab.isDirty}
            onPress={() => setActiveTab(tab.id)}
            onClose={() => closeTab(tab.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  scrollContent: {
    flexDirection: 'row',
  },
});
