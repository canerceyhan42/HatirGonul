import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from './GeminiService';

export interface MoodEntry {
  id: string;
  score: number;
  emoji: string;
  label: string;
  date: string;
  note?: string;
}

const KEYS = {
  CHAT_HISTORY: 'chat_history',
  MOOD_HISTORY: 'mood_history',
  USER_NAME: 'user_name',
  NOTIFICATION_TIMES: 'notification_times',
  NOTIFICATION_ENABLED: 'notification_enabled',
};

export async function saveChatHistory(messages: Message[]): Promise<void> {
  try {
    const serialized = messages.map((m) => ({
      ...m,
      timestamp: m.timestamp.toISOString(),
    }));
    await AsyncStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(serialized));
  } catch (e) {
    console.error('saveChatHistory error:', e);
  }
}

export async function getChatHistory(): Promise<Message[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CHAT_HISTORY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return parsed.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));
  } catch (e) {
    console.error('getChatHistory error:', e);
    return [];
  }
}

export async function saveMoodEntry(entry: MoodEntry): Promise<void> {
  try {
    const existing = await getMoodHistory();
    const updated = [entry, ...existing].slice(0, 100);
    await AsyncStorage.setItem(KEYS.MOOD_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('saveMoodEntry error:', e);
  }
}

export async function getMoodHistory(): Promise<MoodEntry[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.MOOD_HISTORY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export async function saveUserName(name: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_NAME, name);
}

export async function getUserName(): Promise<string> {
  const name = await AsyncStorage.getItem(KEYS.USER_NAME);
  return name || '';
}

export async function saveNotificationTimes(times: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.NOTIFICATION_TIMES, JSON.stringify(times));
}

export async function getNotificationTimes(): Promise<string[]> {
  const data = await AsyncStorage.getItem(KEYS.NOTIFICATION_TIMES);
  if (!data) return ['09:00', '13:00', '19:00'];
  return JSON.parse(data);
}

export async function saveNotificationEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.NOTIFICATION_ENABLED, JSON.stringify(enabled));
}

export async function getNotificationEnabled(): Promise<boolean> {
  const data = await AsyncStorage.getItem(KEYS.NOTIFICATION_ENABLED);
  if (data === null) return true; // varsayılan: açık
  return JSON.parse(data);
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.CHAT_HISTORY,
    KEYS.MOOD_HISTORY,
    KEYS.USER_NAME,
    KEYS.NOTIFICATION_TIMES,
    KEYS.NOTIFICATION_ENABLED,
  ]);
}
