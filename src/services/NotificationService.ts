import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const GREETING_MESSAGES = [
  {
    title: '☀️ Günaydın!',
    body: 'Bugün nasıl uyandin? Gel biraz sohbet edelim 💜',
  },
  {
    title: '🍃 Öğleden merhaba!',
    body: 'Gün ortasında nasılsın? Bir sohbet edelim mi?',
  },
  {
    title: '🌙 İyi akşamlar!',
    body: 'Bugün nasıl geçti? Beraber değerlendirelim mi?',
  },
];

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Bildirimler sadece fiziksel cihazlarda çalışır');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('hatirgonul', {
      name: 'Hatır Gönül',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C5CE7',
    });
  }

  return true;
}

export async function scheduleDailyNotifications(
  times: string[] = ['09:00', '13:00', '19:00']
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (let i = 0; i < times.length; i++) {
    let timeStr = times[i];
    // Kullanıcı : yerine . girerse düzeltelim
    if (timeStr.includes('.')) {
      timeStr = timeStr.replace('.', ':');
    }

    const parts = timeStr.split(':');
    let hour = parseInt(parts[0], 10);
    let minute = parts.length > 1 ? parseInt(parts[1], 10) : 0;

    if (Number.isNaN(hour)) hour = 9;
    if (Number.isNaN(minute)) minute = 0;

    // Saatleri 0-23, dakikaları 0-59 aralığında tutalim
    hour = Math.max(0, Math.min(23, hour));
    minute = Math.max(0, Math.min(59, minute));

    const msg = GREETING_MESSAGES[i] || GREETING_MESSAGES[0];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        data: { screen: 'Chat' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
