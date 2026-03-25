import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getMoodHistory, MoodEntry } from '../services/StorageService';
import { Colors, Gradients, Spacing, BorderRadius } from '../theme/colors';
import { useFocusEffect } from '@react-navigation/native';

export function HistoryScreen() {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    const history = await getMoodHistory();
    setMoodHistory(history);
  };

  const getMoodColor = (score: number): string => {
    const colors = [Colors.mood1, Colors.mood2, Colors.mood3, Colors.mood4, Colors.mood5];
    return colors[score - 1] || Colors.mood3;
  };

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Bugün';
    if (d.toDateString() === yesterday.toDateString()) return 'Dün';
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAverageScore = () => {
    if (moodHistory.length === 0) return 0;
    const sum = moodHistory.reduce((acc, e) => acc + e.score, 0);
    return (sum / moodHistory.length).toFixed(1);
  };

  const getMoodTrend = () => {
    if (moodHistory.length < 2) return '—';
    const recent = moodHistory.slice(0, 3);
    const older = moodHistory.slice(3, 6);
    if (older.length === 0) return '—';
    const recentAvg = recent.reduce((a, b) => a + b.score, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b.score, 0) / older.length;
    if (recentAvg > olderAvg + 0.3) return '↗ İyileşiyor';
    if (recentAvg < olderAvg - 0.3) return '↘ Düşüyor';
    return '→ Sabit';
  };

  const renderItem = ({ item }: { item: MoodEntry }) => {
    const color = getMoodColor(item.score);
    return (
      <View style={[styles.entryCard, { borderLeftColor: color }]}>
        <View style={styles.entryLeft}>
          <Text style={styles.entryEmoji}>{item.emoji}</Text>
          <View>
            <Text style={[styles.entryLabel, { color }]}>{item.label}</Text>
            <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.entryRight}>
          <Text style={styles.entryTime}>{formatTime(item.date)}</Text>
          <View style={styles.scoreContainer}>
            {[1, 2, 3, 4, 5].map((dot) => (
              <View
                key={dot}
                style={[
                  styles.scoreDot,
                  { backgroundColor: dot <= item.score ? color : Colors.bgCardLight },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📊</Text>
      <Text style={styles.emptyTitle}>Henüz kayıt yok</Text>
      <Text style={styles.emptyText}>
        Sohbet ekranından ruh halini seçmeye başla,{'\n'}
        geçmiş burada görünecek.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
      <LinearGradient colors={Gradients.background} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ruh Hali Geçmişi</Text>
          <Text style={styles.headerSubtitle}>{moodHistory.length} kayıt</Text>
        </View>

        {moodHistory.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{getAverageScore()}</Text>
              <Text style={styles.statLabel}>Ort. Puan</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{moodHistory.length}</Text>
              <Text style={styles.statLabel}>Giriş</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValueSmall}>{getMoodTrend()}</Text>
              <Text style={styles.statLabel}>Trend</Text>
            </View>
          </View>
        )}

        <FlatList
          data={moodHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
        />
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
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.primaryLight,
    fontSize: 22,
    fontWeight: '700',
  },
  statValueSmall: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  listContent: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
    flexGrow: 1,
  },
  entryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderLeftWidth: 4,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entryEmoji: {
    fontSize: 28,
  },
  entryLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  entryDate: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  entryRight: {
    alignItems: 'flex-end',
  },
  entryTime: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.md },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
