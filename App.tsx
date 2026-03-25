import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import {
  requestNotificationPermissions,
  scheduleDailyNotifications,
  addNotificationResponseListener,
} from './src/services/NotificationService';
import { getNotificationTimes } from './src/services/StorageService';

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
    const granted = await requestNotificationPermissions();
    if (granted) {
      const times = await getNotificationTimes();
      await scheduleDailyNotifications(times);
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
