import { useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { useGame } from '@/contexts/GameContext';

const SOUND_URLS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3',
  complete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  tap: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  flip: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
};

type SoundType = keyof typeof SOUND_URLS;

export function useGameSound() {
  const { soundEnabled } = useGame();
  const soundRef = useRef<Audio.Sound | null>(null);

  const playSound = useCallback(
    async (type: SoundType) => {
      if (!soundEnabled) return;

      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }

        if (Platform.OS === 'web') {
          const audio = new window.Audio(SOUND_URLS[type]);
          audio.volume = 0.5;
          await audio.play().catch(() => {
            console.log('Audio play failed on web');
          });
          return;
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: SOUND_URLS[type] },
          { shouldPlay: true, volume: 0.5 }
        );
        soundRef.current = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch (error) {
        console.log('Error playing sound:', error);
      }
    },
    [soundEnabled]
  );

  const playCorrect = useCallback(() => playSound('correct'), [playSound]);
  const playIncorrect = useCallback(() => playSound('incorrect'), [playSound]);
  const playComplete = useCallback(() => playSound('complete'), [playSound]);
  const playTap = useCallback(() => playSound('tap'), [playSound]);
  const playFlip = useCallback(() => playSound('flip'), [playSound]);

  return {
    playSound,
    playCorrect,
    playIncorrect,
    playComplete,
    playTap,
    playFlip,
  };
}
