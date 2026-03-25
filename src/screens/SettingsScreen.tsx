import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getUserName,
  saveUserName,
  getNotificationTimes,
  saveNotificationTimes,
  clearAllData,
} from '../services/StorageService';
import {
  requestNotificationPermissions,
  scheduleDailyNotifications,
  cancelAllNotifications,
} from '../services/NotificationService';
import { Colors, Gradients, Spacing, BorderRadius } from '../theme/colors';

const DEFAULT_TIMES = ['09:00', '13:00', '19:00'];

export function SettingsScreen() {
  const [userName, setUserName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifTimes, setNotifTimes] = useState<string[]>(DEFAULT_TIMES);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const [name, times] = await Promise.all([getUserName(), getNotificationTimes()]);
    setUserName(name);
    setNameInput(name);
    setNotifTimes(times);
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    await saveUserName(trimmed);
    setUserName(trimmed);
    Alert.alert('✅ Kaydedildi', trimmed ? `Merhaba ${trimmed}!` : 'İsim temizlendi.');
  };

  const handleNotifToggle = async (value: boolean) => {
    setNotifEnabled(value);
    if (value) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleDailyNotifications(notifTimes);
        Alert.alert('🔔 Bildirimler açıldı', 'Seçilen saatlerde hatırlatma alacaksın.');
      } else {
        setNotifEnabled(false);
        Alert.alert('Bildirim izni', 'Lütfen ayarlardan bildirim iznini ver.');
      }
    } else {
      await cancelAllNotifications();
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...notifTimes];
    newTimes[index] = value;
    setNotifTimes(newTimes);
  };

  const handleSaveTimes = async () => {
    await saveNotificationTimes(notifTimes);
    if (notifEnabled) {
      await scheduleDailyNotifications(notifTimes);
    }
    Alert.alert('✅ Bildirim saatleri güncellendi');
  };

  const handleClearData = () => {
    Alert.alert(
      'Tüm Verileri Sil',
      'Sohbet geçmişin ve ruh hali kayıtların silinecek. Emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            setUserName('');
            setNameInput('');
            setNotifTimes(DEFAULT_TIMES);
            Alert.alert('🗑️ Temizlendi', 'Tüm veriler silindi.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
      <LinearGradient colors={Gradients.background} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ayarlar</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Profil</Text>
            <View style={styles.card}>
              <Text style={styles.label}>İsmin</Text>
              <Text style={styles.hint}>
                AI seni bu isimle tanısın (opsiyonel)
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="Adını gir..."
                  placeholderTextColor={Colors.textMuted}
                  maxLength={30}
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName}>
                  <Text style={styles.saveBtnText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 Bildirimler</Text>
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.label}>Günlük Hatırlatmalar</Text>
                  <Text style={styles.hint}>
                    Gün içinde hal hatır bildirimleri
                  </Text>
                </View>
                <Switch
                  value={notifEnabled}
                  onValueChange={handleNotifToggle}
                  trackColor={{ false: Colors.bgCardLight, true: Colors.primary }}
                  thumbColor={notifEnabled ? Colors.primaryLight : Colors.textMuted}
                />
              </View>

              {notifEnabled && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.label}>Bildirim Saatleri</Text>
                  <Text style={styles.hint}>Saat formatı: SS:DD</Text>
                  {notifTimes.map((time, i) => (
                    <View key={i} style={styles.timeRow}>
                      <Text style={styles.timeLabel}>
                        {i === 0 ? '☀️ Sabah' : i === 1 ? '🌤 Öğle' : '🌙 Akşam'}
                      </Text>
                      <TextInput
                        style={styles.timeInput}
                        value={time}
                        onChangeText={(v) => handleTimeChange(i, v)}
                        placeholder="09:00"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                      />
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.updateTimesBtn}
                    onPress={handleSaveTimes}
                  >
                    <Text style={styles.updateTimesBtnText}>Saatleri Güncelle</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ Hakkında</Text>
            <View style={styles.card}>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutEmoji}>💜</Text>
                <View style={styles.aboutText}>
                  <Text style={styles.label}>Hatır Gönül</Text>
                  <Text style={styles.hint}>
                    Yapay zeka destekli duygusal destek asistanı
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <Text style={styles.aboutInfo}>
                Gemini AI kullanılarak geliştirildi. Verilerini yalnızca kendi cihazında saklar.
              </Text>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
              <Text style={styles.dangerBtnText}>🗑️ Tüm Verileri Sil</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgDark },
  gradient: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.glassBorder,
    marginVertical: Spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  timeLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  timeInput: {
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    color: Colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    width: 80,
    textAlign: 'center',
  },
  updateTimesBtn: {
    backgroundColor: Colors.bgCardLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    padding: 10,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  updateTimesBtnText: {
    color: Colors.primaryLight,
    fontWeight: '600',
    fontSize: 14,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aboutEmoji: { fontSize: 32 },
  aboutText: { flex: 1 },
  aboutInfo: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  dangerBtn: {
    backgroundColor: 'rgba(225,112,85,0.15)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    padding: Spacing.md,
    alignItems: 'center',
  },
  dangerBtnText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 15,
  },
});
