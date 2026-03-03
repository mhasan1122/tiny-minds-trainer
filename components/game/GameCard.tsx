import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { GAME_COLORS } from '@/constants/colors';

type GameCardProps = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  testID?: string;
};

export function GameCard({
  title,
  description,
  icon,
  color,
  route,
  testID,
}: GameCardProps) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ size: number; color: string }>>)[icon] || LucideIcons.Gamepad2;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        testID={testID}
        onPress={() => router.push(route as never)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[styles.card, { borderLeftColor: color, borderLeftWidth: 6 }]}
      >
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <IconComponent size={36} color="#FFFFFF" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <LucideIcons.ChevronRight size={28} color={GAME_COLORS.textLight} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GAME_COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: GAME_COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: GAME_COLORS.textLight,
  },
});
