import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useTabStore } from '../stores/tabStore';

export function useBackHandler() {
  const navigation = useNavigation();
  const hasUnsavedChanges = useTabStore((s) => s.tabs.some((t) => t.isDirty));

  useEffect(() => {
    const onBackPress = () => {
      // Try to close drawer first
      try {
        const state = navigation.getState();
        // Check if drawer might be open by trying to close it
        navigation.dispatch(DrawerActions.closeDrawer());
        return true;
      } catch {
        // Drawer not available
      }

      if (hasUnsavedChanges) {
        Alert.alert(
          'Unsaved Changes',
          'You have unsaved changes. Do you want to discard them?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Discard', style: 'destructive', onPress: () => BackHandler.exitApp() },
          ]
        );
        return true;
      }

      return false; // Let system handle back
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation, hasUnsavedChanges]);
}
