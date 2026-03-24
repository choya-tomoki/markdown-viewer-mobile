import { Drawer } from 'expo-router/drawer';
import { FileBrowserDrawer } from '../../src/components/FileTree/FileBrowserDrawer';
import { useThemeContext } from '../../src/themes/ThemeContext';

function CustomDrawerContent() {
  return <FileBrowserDrawer />;
}

export default function DrawerLayout() {
  const { colors } = useThemeContext();

  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: '85%',
          backgroundColor: colors.drawerBg,
        },
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen name="(editor)" options={{ title: 'Editor' }} />
      <Drawer.Screen name="settings" options={{ title: 'Settings' }} />
    </Drawer>
  );
}
