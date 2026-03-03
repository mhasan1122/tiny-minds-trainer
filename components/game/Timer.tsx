import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { GAME_COLORS } from '@/constants/colors';

type TimerProps = {
  initialTime: number;
  isRunning: boolean;
  onTimeUp: () => void;
};

export function Timer({ initialTime, isRunning, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isRunning || initialTime === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, initialTime, onTimeUp]);

  if (initialTime === 0) return null;

  const isLow = timeLeft <= 10;

  return (
    <View style={[styles.container, isLow && styles.containerLow]}>
      <Clock size={20} color={isLow ? GAME_COLORS.error : GAME_COLORS.text} />
      <Text style={[styles.text, isLow && styles.textLow]}>{timeLeft}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GAME_COLORS.cardBackground,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  containerLow: {
    backgroundColor: '#FEE2E2',
  },
  text: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: GAME_COLORS.text,
  },
  textLow: {
    color: GAME_COLORS.error,
  },
});
