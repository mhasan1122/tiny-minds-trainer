import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty } from '@/constants/gameData';

export type GameScore = {
  gameId: string;
  score: number;
  stars: number;
  difficulty: Difficulty;
  date: string;
};

const STORAGE_KEY = 'brain_kids_game_scores';

export const [GameProvider, useGame] = createContextHook(() => {
  const [totalStars, setTotalStars] = useState(0);
  const [scores, setScores] = useState<GameScore[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('easy');
  const [isLoading, setIsLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setScores(parsed.scores || []);
        setTotalStars(parsed.totalStars || 0);
      }
    } catch (error) {
      console.log('Error loading scores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveScores = async (newScores: GameScore[], newTotalStars: number) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ scores: newScores, totalStars: newTotalStars })
      );
    } catch (error) {
      console.log('Error saving scores:', error);
    }
  };

  const addScore = useCallback((gameId: string, score: number, stars: number) => {
    const newScore: GameScore = {
      gameId,
      score,
      stars,
      difficulty: currentDifficulty,
      date: new Date().toISOString(),
    };

    const newScores = [...scores, newScore];
    const newTotalStars = totalStars + stars;

    setScores(newScores);
    setTotalStars(newTotalStars);
    saveScores(newScores, newTotalStars);
  }, [scores, totalStars, currentDifficulty]);

  const getGameHighScore = useCallback((gameId: string) => {
    const gameScores = scores.filter(s => s.gameId === gameId);
    if (gameScores.length === 0) return 0;
    return Math.max(...gameScores.map(s => s.score));
  }, [scores]);

  const resetProgress = useCallback(async () => {
    setScores([]);
    setTotalStars(0);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return {
    totalStars,
    scores,
    currentDifficulty,
    setCurrentDifficulty,
    addScore,
    getGameHighScore,
    resetProgress,
    isLoading,
    soundEnabled,
    toggleSound,
  };
});
