import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMediaQuery } from 'react-responsive';
import { ArrowLeft, RotateCcw, Volume2, Dog, Cat, Bird } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { GAME_COLORS } from '@/constants/colors';
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

const ANIMALS = [
  { id: 'dog', name: 'Dog', icon: Dog, color: '#8B4513', soundUrl: 'https://www.soundjay.com/animals/dog-barking-1.mp3' },
  { id: 'cat', name: 'Cat', icon: Cat, color: '#FF6B6B', soundUrl: 'https://www.soundjay.com/animals/cat-meow-1.mp3' },
  { id: 'bird', name: 'Bird', icon: Bird, color: '#4ECDC4', soundUrl: 'https://www.soundjay.com/animals/bird-chirp-1.mp3' },
];

const ANIMAL_SOUNDS: Record<string, string[]> = {
  dog: ['Woof!', 'Bark!', 'Ruff!'],
  cat: ['Meow!', 'Purr!', 'Mew!'],
  bird: ['Tweet!', 'Chirp!', 'Peep!'],
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function AnimalSoundGame() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const { currentDifficulty, addScore, soundEnabled } = useGame();
  const { playCorrect, playIncorrect, playComplete } = useGameSound();
  const { shakeAnim, shake } = useShakeAnimation();

  const config = DIFFICULTY_CONFIG[currentDifficulty];
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(5);
  const [targetAnimal, setTargetAnimal] = useState(ANIMALS[0]);
  const [soundText, setSoundText] = useState('');
  const [options, setOptions] = useState(ANIMALS);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const buttonScales = useRef<Animated.Value[]>([]).current;
  const soundRef = useRef<Audio.Sound | null>(null);

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  const generateRound = useCallback(() => {
    const target = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const sounds = ANIMAL_SOUNDS[target.id];
    const sound = sounds[Math.floor(Math.random() * sounds.length)];

    setTargetAnimal(target);
    setSoundText(sound);
    setOptions(shuffleArray([...ANIMALS]));
    setFeedback(null);

    while (buttonScales.length < ANIMALS.length) {
      buttonScales.push(new Animated.Value(1));
    }
  }, [buttonScales]);

  useEffect(() => {
    generateRound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [generateRound]);

  const playAnimalSound = async () => {
    if (!soundEnabled) return;

    setIsPlaying(true);

    try {
      if (Platform.OS === 'web') {
        setTimeout(() => setIsPlaying(false), 500);
        return;
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: targetAnimal.soundUrl },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing animal sound:', error);
      setIsPlaying(false);
    }
  };

  const handleAnimalSelect = (animal: typeof ANIMALS[0], index: number) => {
    if (feedback) return;

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

    if (animal.id === targetAnimal.id) {
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
    addScore('animals', score, stars);
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

        <Text style={styles.headerTitle}>Animal Sounds</Text>

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

            <Text style={styles.instructionText}>Who says this?</Text>

            <Animated.View
              style={[
                styles.soundContainer,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              <Text style={styles.soundText}>{soundText}</Text>
              <TouchableOpacity
                testID="play-sound-button"
                onPress={playAnimalSound}
                style={[styles.playButton, isPlaying && styles.playButtonActive]}
                disabled={isPlaying}
              >
                <Volume2 size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.optionsContainer}>
              {options.map((animal, index) => {
                const IconComponent = animal.icon;
                return (
                  <Animated.View
                    key={animal.id}
                    style={{
                      transform: [{ scale: buttonScales[index] || new Animated.Value(1) }],
                    }}
                  >
                    <TouchableOpacity
                      testID={`animal-option-${animal.id}`}
                      onPress={() => handleAnimalSelect(animal, index)}
                      style={[styles.animalButton, { borderColor: animal.color }]}
                      activeOpacity={0.8}
                    >
                      <IconComponent size={48} color={animal.color} />
                      <Text style={[styles.animalName, { color: animal.color }]}>
                        {animal.name}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.completeContainer}>
            <Text style={styles.completeTitle}>Fantastic!</Text>
            <StarRating stars={getStars()} size={60} animated />
            <Text style={styles.finalScore}>
              You identified {score} animals!
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
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
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
    color: GAME_COLORS.green,
  },
  instructionText: {
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
    color: GAME_COLORS.text,
    marginBottom: 24,
  },
  soundContainer: {
    backgroundColor: GAME_COLORS.cardBackground,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    width: '100%',
  },
  soundText: {
    fontSize: 48,
    fontFamily: 'Nunito_900Black',
    color: GAME_COLORS.text,
    marginBottom: 16,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GAME_COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GAME_COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playButtonActive: {
    backgroundColor: GAME_COLORS.textLight,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  animalButton: {
    width: 100,
    height: 120,
    borderRadius: 20,
    backgroundColor: GAME_COLORS.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 3,
  },
  animalName: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    marginTop: 8,
  },
  completeContainer: {
    alignItems: 'center',
    paddingTop: 40,
    width: '100%',
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
    backgroundColor: GAME_COLORS.green,
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
