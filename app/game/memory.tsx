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
import {
  ArrowLeft,
  RotateCcw,
  Star,
  Heart,
  Moon,
  Sun,
  Cloud,
  Flower2,
  Apple,
  Cherry,
  HelpCircle,
} from 'lucide-react-native';
import { GAME_COLORS, SHAPE_COLORS } from '@/constants/colors';
import { DIFFICULTY_CONFIG } from '@/constants/gameData';
import { useGame } from '@/contexts/GameContext';
import { useGameSound } from '@/hooks/useGameSound';
import { FeedbackText } from '@/components/game/FeedbackText';
import { Timer } from '@/components/game/Timer';
import { StarRating } from '@/components/game/StarRating';
import {
  useFonts,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/dev';

const ICON_COMPONENTS: Record<string, React.ComponentType<{ size: number; color: string; fill?: string }>> = {
  Star,
  Heart,
  Moon,
  Sun,
  Cloud,
  Flower2,
  Apple,
  Cherry,
};

type Card = {
  id: number;
  icon: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MemoryCardGame() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const { currentDifficulty, addScore } = useGame();
  const { playFlip, playCorrect, playIncorrect, playComplete } = useGameSound();

  const config = DIFFICULTY_CONFIG[currentDifficulty];
  const numPairs = currentDifficulty === 'easy' ? 4 : currentDifficulty === 'medium' ? 6 : 8;

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const cardScales = useRef<Animated.Value[]>([]).current;

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  const initializeGame = useCallback(() => {
    const iconNames = Object.keys(ICON_COMPONENTS).slice(0, numPairs);
    const cardPairs: Card[] = [];

    iconNames.forEach((icon, index) => {
      const color = SHAPE_COLORS[index % SHAPE_COLORS.length];
      cardPairs.push(
        { id: index * 2, icon, color, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, icon, color, isFlipped: false, isMatched: false }
      );
    });

    const shuffled = shuffleArray(cardPairs);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setFeedback(null);
    setIsComplete(false);
    setTimerRunning(true);
    setIsProcessing(false);

    while (cardScales.length < shuffled.length) {
      cardScales.push(new Animated.Value(1));
    }
  }, [numPairs, cardScales]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardPress = (cardId: number) => {
    if (isProcessing) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    playFlip();

    const cardIndex = cards.findIndex(c => c.id === cardId);
    Animated.sequence([
      Animated.timing(cardScales[cardIndex], {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(cardScales[cardIndex], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    setCards(prev =>
      prev.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsProcessing(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
        setTimeout(() => {
          setFeedback('correct');
          playCorrect();
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setMatchedPairs(prev => {
            const newPairs = prev + 1;
            if (newPairs === numPairs) {
              handleGameComplete();
            }
            return newPairs;
          });
          setFlippedCards([]);
          setIsProcessing(false);
          setTimeout(() => setFeedback(null), 800);
        }, 500);
      } else {
        setTimeout(() => {
          setFeedback('incorrect');
          playIncorrect();
          setTimeout(() => {
            setCards(prev =>
              prev.map(c =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setFlippedCards([]);
            setIsProcessing(false);
            setFeedback(null);
          }, 800);
        }, 500);
      }
    }
  };

  const handleGameComplete = () => {
    setIsComplete(true);
    setTimerRunning(false);
    playComplete();

    const stars = moves <= numPairs + 2 ? 3 : moves <= numPairs + 5 ? 2 : 1;
    addScore('memory', numPairs * 10 - moves, stars);
  };

  const handleTimeUp = () => {
    handleGameComplete();
  };

  const getStars = () => {
    if (moves <= numPairs + 2) return 3;
    if (moves <= numPairs + 5) return 2;
    return 1;
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

        <Text style={styles.headerTitle}>Memory Cards</Text>

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
            onPress={initializeGame}
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
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Pairs</Text>
                <Text style={styles.statValue}>
                  {matchedPairs}/{numPairs}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Moves</Text>
                <Text style={styles.statValue}>{moves}</Text>
              </View>
            </View>

            <Text style={styles.instructionText}>Find matching pairs!</Text>

            <View style={styles.cardsGrid}>
              {cards.map((card, index) => {
                const IconComponent = ICON_COMPONENTS[card.icon];
                const isRevealed = card.isFlipped || card.isMatched;

                return (
                  <Animated.View
                    key={card.id}
                    style={{
                      transform: [{ scale: cardScales[index] || new Animated.Value(1) }],
                    }}
                  >
                    <TouchableOpacity
                      testID={`card-${card.id}`}
                      onPress={() => handleCardPress(card.id)}
                      style={[
                        styles.card,
                        isRevealed
                          ? styles.cardRevealed
                          : styles.cardHidden,
                        card.isMatched && styles.cardMatched,
                      ]}
                      activeOpacity={0.8}
                      disabled={card.isMatched || isProcessing}
                    >
                      {isRevealed ? (
                        <IconComponent
                          size={36}
                          color={card.color}
                          fill={card.color}
                        />
                      ) : (
                        <HelpCircle size={36} color="#A0AEC0" />
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.completeContainer}>
            <Text style={styles.completeTitle}>Amazing!</Text>
            <StarRating stars={getStars()} size={60} animated />
            <Text style={styles.finalScore}>
              You found all pairs in {moves} moves!
            </Text>
            <TouchableOpacity
              testID="play-again-button"
              onPress={initializeGame}
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
    paddingHorizontal: 16,
    paddingTop: 24,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: GAME_COLORS.textLight,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: GAME_COLORS.orange,
  },
  instructionText: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: GAME_COLORS.text,
    marginBottom: 24,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  card: {
    width: 70,
    height: 70,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHidden: {
    backgroundColor: GAME_COLORS.orange,
  },
  cardRevealed: {
    backgroundColor: GAME_COLORS.cardBackground,
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
  cardMatched: {
    backgroundColor: '#D1FAE5',
    borderColor: GAME_COLORS.success,
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
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    color: GAME_COLORS.text,
    marginTop: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  playAgainButton: {
    backgroundColor: GAME_COLORS.orange,
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
