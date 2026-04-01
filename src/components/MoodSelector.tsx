import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing } from '../theme/colors';

const MOODS = [
  { score: 1, emoji: '😔', label: 'Çok Kötü', color: Colors.mood1 },
  { score: 2, emoji: '😕', label: 'Kötü', color: Colors.mood2 },
  { score: 3, emoji: '😐', label: 'Orta', color: Colors.mood3 },
  { score: 4, emoji: '🙂', label: 'İyi', color: Colors.mood4 },
  { score: 5, emoji: '😊', label: 'Harika', color: Colors.mood5 },
];

interface MoodSelectorProps {
  onSelect: (score: number, emoji: string, label: string) => void;
  selectedScore?: number;
}

// Düzeltme: Hooklar .map() içinde çağrılamaz. Şimdi doğru şekilde tanımladık.
export function MoodSelector({ onSelect, selectedScore }: MoodSelectorProps) {
  const scales = useRef(MOODS.map(() => new Animated.Value(1))).current;

  const handlePress = useCallback(
    (index: number, score: number, emoji: string, label: string) => {
      const s = scales[index];
      Animated.sequence([
        Animated.spring(s, {
          toValue: 1.35,
          tension: 200,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(s, {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      onSelect(score, emoji, label);
    },
    [onSelect]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>Şu an kendini nasıl hissediyorsun?</Text>
      <View style={styles.row}>
        {MOODS.map((mood, i) => (
          <TouchableOpacity
            key={mood.score}
            onPress={() => handlePress(i, mood.score, mood.emoji, mood.label)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.moodItem,
                selectedScore === mood.score && {
                  backgroundColor: mood.color + '33',
                  borderColor: mood.color,
                },
                { transform: [{ scale: scales[i] }] },
              ]}
            >
              <Text style={styles.emoji}>{mood.emoji}</Text>
              <Text
                style={[
                  styles.label,
                  selectedScore === mood.score && { color: mood.color },
                ]}
              >
                {mood.label}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  prompt: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  moodItem: {
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glass,
    minWidth: 58,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});
