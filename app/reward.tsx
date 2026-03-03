import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMediaQuery } from 'react-responsive';
import { Trophy, Star } from 'lucide-react-native';
import { GameButton } from '@/components/game/GameButton';
import { StarRating } from '@/components/game/StarRating';
import { GAME_COLORS } from '@/constants/colors';
import { GameProvider } from '@/contexts/GameContext';
import {
  useFonts,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/dev';

function RewardScreenContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const params = useLocalSearchParams<{ stars?: string; score?: string; game?: string }>();

  const stars = parseInt(params.stars || '0', 10);
  const score = parseInt(params.score || '0', 10);
  const gameName = params.game || 'Game';

  const trophyScale = useRef(new Animated.Value(0)).current;
  const starsOpacity = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array(12)
      .fill(0)
      .map(() => ({
        translateY: new Animated.Value(-100),
        translateX: new Animated.Value(0),
        rotate: new Animated.Value(0),
        opacity: new Animated.Value(1),
      }))
  ).current;

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    Animated.sequence([
      Animated.spring(trophyScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(starsOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    confettiAnims.forEach((anim, index) => {
      const delay = index * 100;
      const xOffset = (Math.random() - 0.5) * 300;

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: 600,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: xOffset,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 360 * 3,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, [trophyScale, starsOpacity, confettiAnims]);

  if (!fontsLoaded) return null;

  const confettiColors = [
    GAME_COLORS.primary,
    GAME_COLORS.secondary,
    GAME_COLORS.accent,
    GAME_COLORS.purple,
    GAME_COLORS.green,
    GAME_COLORS.orange,
  ];

  return (
    <View style={styles.container}>
      {confettiAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              backgroundColor: confettiColors[index % confettiColors.length],
              left: `${(index / confettiAnims.length) * 100}%`,
              transform: [
                { translateY: anim.translateY },
                { translateX: anim.translateX },
                {
                  rotate: anim.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              opacity: anim.opacity,
            },
          ]}
        />
      ))}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + 40,
            maxWidth: isDesktop ? 600 : '100%',
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.trophyContainer,
            { transform: [{ scale: trophyScale }] },
          ]}
        >
          <View style={styles.trophyBackground}>
            <Trophy size={80} color="#FFFFFF" />
          </View>
        </Animated.View>

        <Text style={styles.congratsText}>Congratulations!</Text>
        <Text style={styles.gameText}>You completed {gameName}!</Text>

        <Animated.View style={[styles.starsContainer, { opacity: starsOpacity }]}>
          <StarRating stars={stars} size={60} animated />
        </Animated.View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        <View style={styles.messageContainer}>
          {stars === 3 && (
            <Text style={styles.messageText}>Perfect! You are amazing!</Text>
          )}
          {stars === 2 && (
            <Text style={styles.messageText}>Great job! Keep practicing!</Text>
          )}
          {stars === 1 && (
            <Text style={styles.messageText}>Good try! You can do better!</Text>
          )}
          {stars === 0 && (
            <Text style={styles.messageText}>Nice effort! Try again!</Text>
          )}
        </View>

        <View style={styles.buttonsContainer}>
          <GameButton
            testID="play-again-button"
            title="Play Again"
            onPress={() => router.back()}
            color={GAME_COLORS.primary}
            size="large"
          />

          <GameButton
            testID="back-to-games-button"
            title="More Games"
            onPress={() => router.replace('/games')}
            color={GAME_COLORS.secondary}
            size="medium"
            style={{ marginTop: 16 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

export default function RewardScreen() {
  return (
    <GameProvider>
      <RewardScreenContent />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confetti: {
    position: 'absolute',
    top: 0,
    width: 16,
    height: 16,
    borderRadius: 4,
    zIndex: 10,
  },
  trophyContainer: {
    marginBottom: 24,
  },
  trophyBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: GAME_COLORS.star,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GAME_COLORS.star,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  congratsText: {
    fontSize: 36,
    fontFamily: 'Nunito_900Black',
    color: GAME_COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  gameText: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: GAME_COLORS.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  starsContainer: {
    marginBottom: 32,
  },
  scoreCard: {
    backgroundColor: GAME_COLORS.cardBackground,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minWidth: 200,
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: GAME_COLORS.textLight,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: 'Nunito_900Black',
    color: GAME_COLORS.primary,
  },
  messageContainer: {
    marginBottom: 40,
  },
  messageText: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: GAME_COLORS.text,
    textAlign: 'center',
  },
  buttonsContainer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
});
