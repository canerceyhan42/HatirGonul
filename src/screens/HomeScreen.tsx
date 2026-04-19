import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors, Gradients, Spacing, BorderRadius } from '../theme/colors';
import { getUserName, getMoodHistory } from '../services/StorageService';

export function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [todayMood, setTodayMood] = useState<any>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadData = async () => {
      const [name, moodHist] = await Promise.all([getUserName(), getMoodHistory()]);
      setUserName(name);

      const todayStr = new Date().toDateString();
      const moodToday = moodHist.find(m => new Date(m.date).toDateString() === todayStr);
      setTodayMood(moodToday);
    };

    const unsubscribe = navigation.addListener('focus', loadData);
    loadData();

    return unsubscribe;
  }, [navigation]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
      <LinearGradient colors={Gradients.background} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.greeting}>{getTimeGreeting()}{userName ? `, ${userName}` : ''} 👋</Text>
            <Text style={styles.subtitle}>Bugün sana nasıl yardımcı olabilirim?</Text>
          </View>

          <View style={styles.card}>
            <LinearGradient colors={['rgba(108,92,231,0.2)', 'rgba(162,155,254,0.1)']} style={styles.cardGradient}>
              {todayMood ? (
                <>
                  <Text style={styles.cardTitle}>Bugünkü Ruh Halin</Text>
                  <Text style={styles.moodEmoji}>{todayMood.emoji}</Text>
                  <Text style={styles.moodLabel}>{todayMood.label}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.cardTitle}>Bugün nasılsın?</Text>
                  <Text style={styles.cardDesc}>Henüz bugünün ruh halini girmedin. Hemen AI ile sohbete başla ve gününü değerlendir!</Text>
                </>
              )}
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Chat')}>
                <Text style={styles.actionBtnText}>{todayMood ? 'Sohbete Devam Et' : 'Sohbete Başla'}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.menuGrid}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('History')}>
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={styles.menuText}>Ruh Hali Geçmişi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.menuIcon}>⚙️</Text>
              <Text style={styles.menuText}>Ayarlar</Text>
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
  scrollContent: { padding: Spacing.md, paddingBottom: 40 },
  header: { marginTop: Spacing.xl, marginBottom: Spacing.xl },
  greeting: { color: Colors.textPrimary, fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: Colors.textSecondary, fontSize: 16 },
  card: {
    borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  cardGradient: { padding: Spacing.xl, alignItems: 'center' },
  cardTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: Spacing.md },
  cardDesc: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: Spacing.lg, lineHeight: 20 },
  moodEmoji: { fontSize: 48, marginBottom: 8 },
  moodLabel: { color: Colors.primaryLight, fontSize: 18, fontWeight: '600', marginBottom: Spacing.lg },
  actionBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.full },
  actionBtnText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  menuGrid: { flexDirection: 'row', gap: Spacing.md },
  menuItem: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.glassBorder
  },
  menuIcon: { fontSize: 32, marginBottom: Spacing.sm },
  menuText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', textAlign: 'center' }
});
