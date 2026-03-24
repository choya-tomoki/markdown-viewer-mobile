import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EditorContainer } from '../../../src/components/Editor/EditorContainer';
import { EditorStatusBar } from '../../../src/components/StatusBar/EditorStatusBar';
import { TabBar } from '../../../src/components/TabBar/TabBar';
import { useThemeContext } from '../../../src/themes/ThemeContext';
import { useBackHandler } from '../../../src/hooks/useBackHandler';

export default function EditorScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { colors } = useThemeContext();

  useBackHandler();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const openSettings = () => {
    router.push('/settings');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <Pressable onPress={openDrawer} style={styles.iconButton}>
          <Ionicons name="menu" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerSpacer} />
        <Pressable onPress={openSettings} style={styles.iconButton}>
          <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>
      <TabBar />
      <EditorContainer />
      <EditorStatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerSpacer: {
    flex: 1,
  },
});
