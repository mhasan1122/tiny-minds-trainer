import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Star } from 'lucide-react-native';
import { GAME_COLORS } from '@/constants/colors';

type StarRatingProps = {
  stars: number;
  maxStars?: number;
  size?: number;
  animated?: boolean;
};

export function StarRating({
  stars,
  maxStars = 3,
  size = 40,
  animated = false,
}: StarRatingProps) {
  const scaleAnims = useRef(
    Array(maxStars)
      .fill(0)
      .map(() => new Animated.Value(animated ? 0 : 1))
  ).current;

  useEffect(() => {
    if (animated) {
      const animations = scaleAnims.map((anim, index) =>
        Animated.sequence([
          Animated.delay(index * 300),
          Animated.spring(anim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ])
      );
      Animated.parallel(animations).start();
    }
  }, [animated, scaleAnims]);

  return (
    <View style={styles.container}>
      {Array(maxStars)
        .fill(0)
        .map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.starContainer,
              {
                transform: [{ scale: scaleAnims[index] }],
              },
            ]}
          >
            <Star
              size={size}
              color={index < stars ? GAME_COLORS.star : '#E2E8F0'}
              fill={index < stars ? GAME_COLORS.star : 'transparent'}
            />
          </Animated.View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  starContainer: {
    marginHorizontal: 4,
  },
});
