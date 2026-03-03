import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMediaQuery } from 'react-responsive';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';
import { GAME_COLORS, GAME_COLOR_OPTIONS } from '@/constants/colors';
import { DIFFICULTY_CONFIG } from '@/constants/gameData';
import { useGame } from '@/contexts/GameContext';
import { useGameSound } from '@/hooks/useGameSound';
import { useShakeAnimation } from '@/hooks/useShakeAnimation';
import { FeedbackText } from '@/components/game/FeedbackText';
import { Timer } from '@/components/game/Timer';
import { StarRating } from '@/components/game/StarRating';
import {
  useFonts,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/dev';

type ColorOption = {
  name: string;
  value: string;
  label: string;
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ColorMatchingGame() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const { currentDifficulty, addScore } = useGame();
  const { playCorrect, playIncorrect, playComplete } = useGameSound();
  const { shakeAnim, shake } = useShakeAnimation();

  const config = DIFFICULTY_CONFIG[currentDifficulty];
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(5);
  const [targetColor, setTargetColor] = useState<ColorOption | null>(null);
  const [options, setOptions] = useState<ColorOption[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);

  const buttonScales = useRef<Animated.Value[]>([]).current;

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  const generateRound = useCallback(() => {
    const numOptions = config.itemCount > GAME_COLOR_OPTIONS.length
      ? GAME_COLOR_OPTIONS.length
      : config.itemCount;

    const shuffledColors = shuffleArray(GAME_COLOR_OPTIONS);
    const selectedOptions = shuffledColors.slice(0, numOptions);
    const target = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];

    setTargetColor(target);
    setOptions(shuffleArray(selectedOptions));
    setFeedback(null);

    while (buttonScales.length < numOptions) {
      buttonScales.push(new Animated.Value(1));
    }
  }, [config.itemCount, buttonScales]);

  useEffect(() => {
    generateRound();
  }, [generateRound]);

  const handleColorSelect = (color: ColorOption, index: number) => {
    if (feedback || !targetColor) return;

    Animated.sequence([
      Animated.timing(buttonScales[index], {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScales[index], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    if (color.name === targetColor.name) {
      setFeedback('correct');
      setScore((prev) => prev + 1);
      playCorrect();

      setTimeout(() => {
        if (round >= totalRounds) {
          handleGameComplete();
        } else {
          setRound((prev) => prev + 1);
          generateRound();
        }
      }, 1000);
    } else {
      setFeedback('incorrect');
      playIncorrect();
      shake();

      setTimeout(() => {
        setFeedback(null);
      }, 1000);
    }
  };

  const handleGameComplete = () => {
    setIsComplete(true);
    setTimerRunning(false);
    playComplete();

    const stars = score >= config.starThreshold[2] ? 3 : score >= config.starThreshold[1] ? 2 : score >= config.starThreshold[0] ? 1 : 0;
    addScore('colors', score, stars);
  };

  const handleTimeUp = () => {
    handleGameComplete();
  };

  const handleRestart = () => {
    setScore(0);
    setRound(1);
    setIsComplete(false);
    setTimerRunning(true);
    generateRound();
  };

  const getStars = () => {
    if (score >= config.starThreshold[2]) return 3;
    if (score >= config.starThreshold[1]) return 2;
    if (score >= config.starThreshold[0]) return 1;
    return 0;
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          testID="back-button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={28} color={GAME_COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Color Match</Text>

        <View style={styles.headerRight}>
          {config.timeLimit > 0 && (
            <Timer
              initialTime={config.timeLimit}
              isRunning={timerRunning && !isComplete}
              onTimeUp={handleTimeUp}
            />
          )}
          <TouchableOpacity
            testID="restart-button"
            onPress={handleRestart}
            style={styles.restartButton}
          >
            <RotateCcw size={24} color={GAME_COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            maxWidth: isDesktop ? 600 : '100%',
            alignSelf: 'center',
            width: '100%',
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        {!isComplete ? (
          <>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Round {round} of {totalRounds}
              </Text>
              <Text style={styles.scoreText}>Score: {score}</Text>
            </View>

            <Animated.View
              style={[
                styles.targetContainer,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              <Text style={styles.instructionText}>Tap the</Text>
              <Text style={[styles.targetColorText, { color: targetColor?.value }]}>
                {targetColor?.name}
              </Text>
              <Text style={styles.instructionText}>color!</Text>
            </Animated.View>

            <View style={styles.optionsGrid}>
              {options.map((color, index) => (
                <Animated.View
                  key={color.name}
                  style={{ transform: [{ scale: buttonScales[index] || new Animated.Value(1) }] }}
                >
                  <TouchableOpacity
                    testID={`color-option-${color.name.toLowerCase()}`}
                    onPress={() => handleColorSelect(color, index)}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color.value },
                    ]}
                    activeOpacity={0.8}
                  />
                </Animated.View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.completeContainer}>
            <Text style={styles.completeTitle}>Great Job!</Text>
            <StarRating stars={getStars()} size={60} animated />
            <Text style={styles.finalScore}>
              You got {score} out of {totalRounds}!
            </Text>
            <TouchableOpacity
              testID="play-again-button"
              onPress={handleRestart}
              style={styles.playAgainButton}
            >
              <Text style={styles.playAgainText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="back-to-games-button"
              onPress={() => router.back()}
              style={styles.backToGamesButton}
            >
              <Text style={styles.backToGamesText}>Back to Games</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <FeedbackText type={feedback || 'correct'} visible={feedback !== null} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: GAME_COLORS.cardBackground,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GAME_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: GAME_COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  restartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GAME_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: GAME_COLORS.textLight,
  },
  scoreText: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    color: GAME_COLORS.primary,
  },
  targetContainer: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 24,
    backgroundColor: GAME_COLORS.cardBackground,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  instructionText: {
    fontSize: 24,
    fontFamily: 'Nunito_700Bold',
    color: GAME_COLORS.text,
  },
  targetColorText: {
    fontSize: 48,
    fontFamily: 'Nunito_900Black',
    marginVertical: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  colorButton: {
    width: 100,
    height: 100,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  completeContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  completeTitle: {
    fontSize: 48,
    fontFamily: 'Nunito_900Black',
    color: GAME_COLORS.star,
    marginBottom: 24,
  },
  finalScore: {
    fontSize: 24,
    fontFamily: 'Nunito_700Bold',
    color: GAME_COLORS.text,
    marginTop: 24,
    marginBottom: 32,
  },
  playAgainButton: {
    backgroundColor: GAME_COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 25,
    marginBottom: 16,
  },
  playAgainText: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#FFFFFF',
  },
  backToGamesButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  backToGamesText: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: GAME_COLORS.textLight,
  },
});
