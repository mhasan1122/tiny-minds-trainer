import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMediaQuery } from 'react-responsive';
import { Brain, Star, Sparkles } from 'lucide-react-native';
import { GameButton } from '@/components/game/GameButton';
import { GAME_COLORS } from '@/constants/colors';
import { GameProvider, useGame } from '@/contexts/GameContext';
import {
  useFonts,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/dev';

function WelcomeScreenContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { totalStars, isLoading } = useGame();
  const isDesktop = useMediaQuery({ minWidth: 768 });

  const logoScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [logoScale, titleOpacity, buttonOpacity, floatAnim]);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40,
            maxWidth: isDesktop ? 600 : '100%',
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.starsContainer}>
          <Star size={24} color={GAME_COLORS.star} fill={GAME_COLORS.star} />
          <Text style={styles.starsText}>{totalStars}</Text>
        </View>

        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: logoScale },
                { translateY: floatTranslate },
              ],
            },
          ]}
        >
          <View style={styles.logoBackground}>
            <Brain size={80} color="#FFFFFF" />
          </View>
          <Sparkles
            size={32}
            color={GAME_COLORS.star}
            style={styles.sparkle1}
          />
          <Sparkles
            size={24}
            color={GAME_COLORS.accent}
            style={styles.sparkle2}
          />
        </Animated.View>

        <Animated.View style={{ opacity: titleOpacity }}>
          <Text style={styles.title}>Brain Kids</Text>
          <Text style={styles.subtitle}>Fun Learning Games!</Text>
        </Animated.View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <View style={[styles.featureBadge, { backgroundColor: GAME_COLORS.primary }]}>
              <Text style={styles.featureBadgeText}>Colors</Text>
            </View>
            <View style={[styles.featureBadge, { backgroundColor: GAME_COLORS.secondary }]}>
              <Text style={styles.featureBadgeText}>Counting</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureBadge, { backgroundColor: GAME_COLORS.purple }]}>
              <Text style={styles.featureBadgeText}>Shapes</Text>
            </View>
            <View style={[styles.featureBadge, { backgroundColor: GAME_COLORS.orange }]}>
              <Text style={styles.featureBadgeText}>Memory</Text>
            </View>
          </View>
          <View style={[styles.featureBadge, { backgroundColor: GAME_COLORS.green, alignSelf: 'center' }]}>
            <Text style={styles.featureBadgeText}>Animals</Text>
          </View>
        </View>

        <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
          <GameButton
            testID="start-button"
            title="START PLAYING"
            onPress={() => router.push('/games')}
            color={GAME_COLORS.primary}
            size="large"
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

export default function WelcomeScreen() {
  return (
    <GameProvider>
      <WelcomeScreenContent />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 18,
    color: GAME_COLORS.textLight,
    textAlign: 'center',
    marginTop: 100,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GAME_COLORS.cardBackground,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignSelf: 'flex-end',
  },
  starsText: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: GAME_COLORS.text,
    marginLeft: 8,
  },
  logoContainer: {
    marginTop: 40,
    marginBottom: 30,
    position: 'relative',
  },
  logoBackground: {
    width: 160,
    height: 160,
    borderRadius: 40,
    backgroundColor: GAME_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GAME_COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  sparkle1: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 10,
    left: -15,
  },
  title: {
    fontSize: 48,
    fontFamily: 'Nunito_900Black',
    color: GAME_COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    color: GAME_COLORS.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresContainer: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featureBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  featureBadgeText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
});
