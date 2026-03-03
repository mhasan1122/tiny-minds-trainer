import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { GAME_COLORS } from '@/constants/colors';
import { FEEDBACK_MESSAGES } from '@/constants/gameData';

type FeedbackTextProps = {
  type: 'correct' | 'incorrect' | 'complete';
  visible: boolean;
  customMessage?: string;
};

function getRandomMessage(type: 'correct' | 'incorrect' | 'complete'): string {
  const messages = FEEDBACK_MESSAGES[type];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function FeedbackText({ type, visible, customMessage }: FeedbackTextProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  const colors = {
    correct: GAME_COLORS.success,
    incorrect: GAME_COLORS.error,
    complete: GAME_COLORS.star,
  };

  const message = customMessage || getRandomMessage(type);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={[styles.text, { color: colors[type] }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  text: {
    fontSize: 48,
    fontWeight: '900' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
