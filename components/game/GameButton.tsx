import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { GAME_COLORS } from '@/constants/colors';

type GameButtonProps = {
  title: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export function GameButton({
  title,
  onPress,
  color = GAME_COLORS.primary,
  textColor = '#FFFFFF',
  size = 'medium',
  disabled = false,
  style,
  testID,
}: GameButtonProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

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

  const sizeStyles = {
    small: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 },
    medium: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 20 },
    large: { paddingVertical: 20, paddingHorizontal: 48, fontSize: 24 },
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
        style={[
          styles.button,
          {
            backgroundColor: disabled ? '#CBD5E0' : color,
            paddingVertical: sizeStyles[size].paddingVertical,
            paddingHorizontal: sizeStyles[size].paddingHorizontal,
          },
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: sizeStyles[size].fontSize,
            },
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
});
