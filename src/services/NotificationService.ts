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

export async function scheduleRandomNotifications(
  daysAhead: number = 14
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();

  // Her gün için 3 aralık belirleyelim.
  // 1: Sabah (09:00 - 12:00)
  // 2: Öğle (13:00 - 17:00)
  // 3: Akşam (18:00 - 21:00)
  for (let i = 0; i < daysAhead; i++) {
    const baseDate = new Date(now);
    baseDate.setDate(now.getDate() + i);

    const timeRanges = [
      { startHour: 9, endHour: 11, msgIndex: 0 },
      { startHour: 13, endHour: 16, msgIndex: 1 },
      { startHour: 18, endHour: 20, msgIndex: 2 },
    ];

    for (const range of timeRanges) {
      const randomHour = Math.floor(Math.random() * (range.endHour - range.startHour + 1)) + range.startHour;
      const randomMinute = Math.floor(Math.random() * 60);

      const triggerDate = new Date(baseDate);
      triggerDate.setHours(randomHour, randomMinute, 0, 0);

      // Geçmiş zamana bildirim kurmamak için kontrol ediyoruz.
      if (triggerDate.getTime() > now.getTime()) {
        const msg = GREETING_MESSAGES[range.msgIndex];

        await Notifications.scheduleNotificationAsync({
          content: {
            title: msg.title,
            body: msg.body,
            data: { screen: 'Chat' },
            sound: true,
          },
          trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate 
          },
        });
      }
    }
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
