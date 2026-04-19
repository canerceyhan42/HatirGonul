import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import {
  requestNotificationPermissions,
  scheduleRandomNotifications,
  addNotificationResponseListener,
} from './src/services/NotificationService';
import { getNotificationEnabled } from './src/services/StorageService';

export default function App() {
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    setupNotifications();
    const sub = addNotificationResponseListener((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen && navigationRef.current) {
        navigationRef.current.navigate(screen);
      }
    });
    return () => sub.remove();
  }, []);

  const setupNotifications = async () => {
    const enabled = await getNotificationEnabled();
    if (!enabled) return; // kullanıcı bildirimleri kapattıysa planlama
    const granted = await requestNotificationPermissions();
    if (granted) {
      await scheduleRandomNotifications(); // 14 günlük rastgele planlama
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
