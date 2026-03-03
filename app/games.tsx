import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMediaQuery } from 'react-responsive';
import { ArrowLeft, Star, Volume2, VolumeX } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { GameCard } from '@/components/game/GameCard';
import { DifficultySelector } from '@/components/game/DifficultySelector';
import { GAME_COLORS } from '@/constants/colors';
import { GAME_TYPES } from '@/constants/gameData';
import { GameProvider, useGame } from '@/contexts/GameContext';
import {
  useFonts,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/dev';

function GameSelectionContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { totalStars, soundEnabled, toggleSound } = useGame();
  const isDesktop = useMediaQuery({ minWidth: 768 });

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

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

        <Text style={styles.headerTitle}>Choose a Game</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            testID="sound-toggle"
            onPress={toggleSound}
            style={styles.soundButton}
          >
            {soundEnabled ? (
              <Volume2 size={24} color={GAME_COLORS.text} />
            ) : (
              <VolumeX size={24} color={GAME_COLORS.textLight} />
            )}
          </TouchableOpacity>

          <View style={styles.starsContainer}>
            <Star size={20} color={GAME_COLORS.star} fill={GAME_COLORS.star} />
            <Text style={styles.starsText}>{totalStars}</Text>
          </View>
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
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Select Difficulty</Text>
        <DifficultySelector />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Mini Games</Text>

        {GAME_TYPES.map((game) => (
          <GameCard
            key={game.id}
            testID={`game-card-${game.id}`}
            {...game}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default function GameSelectionScreen() {
  return (
    <GameProvider>
      <GameSelectionContent />
    </GameProvider>
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
  soundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GAME_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GAME_COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  starsText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: GAME_COLORS.text,
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: GAME_COLORS.textLight,
    marginBottom: 8,
  },
});
