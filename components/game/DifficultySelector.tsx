import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DIFFICULTY_CONFIG, Difficulty } from '@/constants/gameData';
import { useGame } from '@/contexts/GameContext';

export function DifficultySelector() {
  const { currentDifficulty, setCurrentDifficulty } = useGame();

  return (
    <View style={styles.container}>
      {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((difficulty) => {
        const config = DIFFICULTY_CONFIG[difficulty];
        const isSelected = currentDifficulty === difficulty;

        return (
          <TouchableOpacity
            key={difficulty}
            testID={`difficulty-${difficulty}`}
            onPress={() => setCurrentDifficulty(difficulty)}
            style={[
              styles.button,
              {
                backgroundColor: isSelected ? config.color : '#F1F5F9',
                borderColor: config.color,
                borderWidth: isSelected ? 0 : 2,
              },
            ]}
          >
            <Text
              style={[
                styles.text,
                { color: isSelected ? '#FFFFFF' : config.color },
              ]}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
